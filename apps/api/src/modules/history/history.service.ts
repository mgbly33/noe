import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async listHistory(authorization: string | undefined) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    await this.authService.assertUserHasLatestConsent(tokenPayload.user_id);

    const readings = await this.prisma.reading.findMany({
      where: {
        user_id: tokenPayload.user_id,
        reading_status: {
          in: ['READY', 'FOLLOW_UP'],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      items: readings.map((reading) => ({
        reading_id: reading.reading_id,
        session_id: reading.session_id,
        reading_status: reading.reading_status,
        risk_level: reading.risk_level,
        spread_type: reading.spread_type,
      })),
    };
  }

  async archiveReading(authorization: string | undefined, readingId: string) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    await this.authService.assertUserHasLatestConsent(tokenPayload.user_id);

    const reading = await this.prisma.reading.findFirst({
      where: {
        reading_id: readingId,
        user_id: tokenPayload.user_id,
      },
    });
    if (!reading) {
      throw new NotFoundException('Reading does not exist.');
    }

    await this.prisma.reading.update({
      where: {
        id: reading.id,
      },
      data: {
        reading_status: 'ARCHIVED',
      },
    });

    return {
      reading_id: reading.reading_id,
      archived: true,
    };
  }
}
