import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { createBusinessId } from '../../common/id';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AssetsService } from '../assets/assets.service';
import { DrawService } from './draw.service';
import { GenerationService } from './generation.service';

type StoredDrawCard = {
  card_id: string;
  card_name: string;
  position: number;
  orientation: string;
};

@Injectable()
export class ReadingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly assetsService: AssetsService,
    private readonly drawService: DrawService,
    private readonly generationService: GenerationService,
  ) {}

  async createReading(
    authorization: string | undefined,
    body: { session_id: string },
  ) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    await this.authService.assertUserHasLatestConsent(tokenPayload.user_id);

    const session = await this.prisma.questionSession.findFirst({
      where: {
        session_id: body.session_id,
        user_id: tokenPayload.user_id,
      },
    });
    if (!session) {
      throw new NotFoundException('Question session does not exist.');
    }
    if (session.risk_level === 'BLOCK') {
      throw new BadRequestException('Blocked sessions cannot create readings.');
    }

    const existingReading = await this.prisma.reading.findFirst({
      where: {
        user_id: tokenPayload.user_id,
        session_id: body.session_id,
        reading_status: {
          in: ['DRAW_READY', 'DRAWN', 'GENERATING', 'READY', 'FOLLOW_UP'],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    if (existingReading) {
      return this.toReadingSummary(existingReading);
    }

    const order = await this.prisma.order.findFirst({
      where: {
        user_id: tokenPayload.user_id,
        session_id: body.session_id,
        order_status: 'PAID',
      },
      orderBy: [
        {
          paid_at: 'desc',
        },
        {
          created_at: 'desc',
        },
      ],
    });
    if (!order) {
      throw new BadRequestException(
        'A paid order is required before creating a reading.',
      );
    }

    const sku = await this.prisma.productSku.findFirst({
      where: {
        sku_id: order.sku_id,
      },
    });
    if (!sku) {
      throw new NotFoundException('SKU does not exist.');
    }

    const readingId = createBusinessId('rdg');
    const reading = await this.prisma.$transaction(async (tx) => {
      const lockedAsset = await this.assetsService.lockAssetForOrder(
        tokenPayload.user_id,
        order.order_id,
        readingId,
        tx,
      );

      return tx.reading.create({
        data: {
          reading_id: readingId,
          user_id: tokenPayload.user_id,
          session_id: body.session_id,
          spread_type: sku.reading_type,
          question_text: session.question_text,
          reading_status: 'DRAW_READY',
          risk_level: session.risk_level,
          source_order_id: order.order_id,
          source_asset_id: lockedAsset.asset_id,
        },
      });
    });

    return this.toReadingSummary(reading);
  }

  async drawReading(
    authorization: string | undefined,
    readingId: string,
    body: { reversed_enabled: boolean },
  ) {
    const reading = await this.requireOwnedReading(authorization, readingId);
    const existingDraw = await this.prisma.drawResult.findFirst({
      where: {
        reading_id: reading.reading_id,
      },
    });

    if (existingDraw) {
      return {
        ...this.toReadingSummary(reading),
        cards: this.parseStoredCards(existingDraw.cards_json),
      };
    }

    if (reading.reading_status !== 'DRAW_READY') {
      throw new BadRequestException('Reading is not ready to draw.');
    }

    const draw = this.drawService.createDraw({
      spreadType:
        reading.spread_type === 'one_card' ? 'one_card' : 'three_cards',
      reversedEnabled: body.reversed_enabled,
      seed: reading.reading_id,
    });
    const storedCards = draw.cards.map<StoredDrawCard>((card) => ({
      card_id: card.cardId,
      card_name: card.cardName,
      position: card.position,
      orientation: card.orientation,
    }));

    await this.prisma.$transaction([
      this.prisma.drawResult.create({
        data: {
          draw_id: createBusinessId('draw'),
          reading_id: reading.reading_id,
          deck_version: 'phase1-major-arcana',
          spread_type: reading.spread_type,
          cards_json: storedCards,
          reversed_enabled: body.reversed_enabled,
          random_signature: draw.signature,
          drawn_at: new Date(),
        },
      }),
      this.prisma.reading.update({
        where: {
          id: reading.id,
        },
        data: {
          reading_status: 'DRAWN',
        },
      }),
    ]);

    return {
      ...this.toReadingSummary({
        ...reading,
        reading_status: 'DRAWN',
      }),
      cards: storedCards,
    };
  }

  async generateReading(
    authorization: string | undefined,
    readingId: string,
    body: {
      style: string;
      disclaimer_version: string;
    },
  ) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    await this.authService.assertUserHasLatestConsent(tokenPayload.user_id);

    const reading = await this.findOwnedReading(
      tokenPayload.user_id,
      readingId,
    );
    if (!reading) {
      throw new NotFoundException('Reading does not exist.');
    }

    const existingInterpretation = await this.prisma.interpretation.findFirst({
      where: {
        reading_id: reading.reading_id,
      },
    });
    if (existingInterpretation) {
      return {
        ...this.toReadingSummary({
          ...reading,
          reading_status: 'READY',
        }),
        structured_result: existingInterpretation.structured_json as Record<
          string,
          unknown
        >,
        final_text: existingInterpretation.final_text ?? '',
      };
    }

    if (reading.reading_status !== 'DRAWN') {
      throw new BadRequestException('Reading must be drawn before generation.');
    }

    const draw = await this.prisma.drawResult.findFirst({
      where: {
        reading_id: reading.reading_id,
      },
    });
    if (!draw) {
      throw new BadRequestException('Draw result does not exist.');
    }

    await this.prisma.reading.update({
      where: {
        id: reading.id,
      },
      data: {
        reading_status: 'GENERATING',
        style_code: body.style,
        disclaimer_version: body.disclaimer_version,
      },
    });

    try {
      const generated = await this.generationService.generateReading({
        reading,
        draw,
        style: body.style,
        disclaimerVersion: body.disclaimer_version,
      });

      await this.prisma.$transaction(async (tx) => {
        await tx.interpretation.create({
          data: {
            interpretation_id: createBusinessId('itr'),
            reading_id: reading.reading_id,
            structured_json: generated.structuredResult,
            final_text: generated.finalText,
            model_vendor: generated.modelVendor,
            model_version: generated.modelVersion,
            prompt_version: generated.promptVersion,
            policy_version: generated.policyVersion,
            safety_result: generated.safetyResult,
            latency_ms: generated.latencyMs,
            token_input: generated.tokenInput,
            token_output: generated.tokenOutput,
          },
        });
        await tx.reading.update({
          where: {
            id: reading.id,
          },
          data: {
            reading_status: 'READY',
            style_code: body.style,
            disclaimer_version: body.disclaimer_version,
          },
        });

        if (reading.source_asset_id) {
          await this.assetsService.consumeLockedAsset(
            tokenPayload.user_id,
            reading.source_asset_id,
            reading.reading_id,
            tx,
          );
        }
      });

      return {
        ...this.toReadingSummary({
          ...reading,
          reading_status: 'READY',
        }),
        structured_result: generated.structuredResult,
        final_text: generated.finalText,
      };
    } catch (error) {
      await this.prisma.$transaction(async (tx) => {
        if (reading.source_asset_id) {
          await this.assetsService.releaseLockedAsset(
            tokenPayload.user_id,
            reading.source_asset_id,
            reading.reading_id,
            tx,
          );
        }

        await tx.reading.update({
          where: {
            id: reading.id,
          },
          data: {
            reading_status: 'ARCHIVED',
            style_code: body.style,
            disclaimer_version: body.disclaimer_version,
          },
        });
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading generation failed.');
    }
  }

  async getReading(authorization: string | undefined, readingId: string) {
    const reading = await this.requireOwnedReading(authorization, readingId);
    const draw = await this.prisma.drawResult.findFirst({
      where: {
        reading_id: reading.reading_id,
      },
    });
    const interpretation = await this.prisma.interpretation.findFirst({
      where: {
        reading_id: reading.reading_id,
      },
    });

    return {
      ...this.toReadingSummary(reading),
      spread_type: reading.spread_type,
      draw: draw
        ? {
            cards: this.parseStoredCards(draw.cards_json),
            reversed_enabled: draw.reversed_enabled,
          }
        : null,
      interpretation: interpretation
        ? {
            structured_result: interpretation.structured_json as Record<
              string,
              unknown
            >,
            final_text: interpretation.final_text,
            policy_version: interpretation.policy_version,
          }
        : null,
    };
  }

  private async requireOwnedReading(
    authorization: string | undefined,
    readingId: string,
  ) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    await this.authService.assertUserHasLatestConsent(tokenPayload.user_id);

    const reading = await this.findOwnedReading(
      tokenPayload.user_id,
      readingId,
    );
    if (!reading) {
      throw new NotFoundException('Reading does not exist.');
    }

    return reading;
  }

  private async findOwnedReading(userId: string, readingId: string) {
    return this.prisma.reading.findFirst({
      where: {
        reading_id: readingId,
        user_id: userId,
      },
    });
  }

  private parseStoredCards(cardsJson: unknown) {
    if (!Array.isArray(cardsJson)) {
      throw new InternalServerErrorException('Stored draw cards are invalid.');
    }

    return cardsJson as StoredDrawCard[];
  }

  private toReadingSummary(reading: {
    reading_id: string;
    session_id: string;
    reading_status: string;
    risk_level: string;
  }) {
    return {
      reading_id: reading.reading_id,
      session_id: reading.session_id,
      reading_status: reading.reading_status,
      risk_level: reading.risk_level,
    };
  }
}
