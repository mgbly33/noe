import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createOrder(
    authorization: string | undefined,
    body: {
      session_id: string;
      sku_id: string;
      source?: string;
    },
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
      throw new BadRequestException('Blocked sessions cannot create orders.');
    }

    const sku = await this.prisma.productSku.findFirst({
      where: {
        sku_id: body.sku_id,
        status: 'active',
      },
    });
    if (!sku) {
      throw new NotFoundException('SKU does not exist.');
    }

    const existing = await this.prisma.order.findFirst({
      where: {
        user_id: tokenPayload.user_id,
        session_id: body.session_id,
        sku_id: body.sku_id,
        order_status: {
          in: ['CREATED', 'PAYING', 'PAID'],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (existing) {
      return {
        order_id: existing.order_id,
        amount: Number(existing.amount),
        discount_amount: Number(existing.discount_amount),
        payable_amount: Number(existing.payable_amount),
        pay_status: existing.pay_status,
        expire_at:
          existing.expired_at?.toISOString() ?? new Date().toISOString(),
      };
    }

    const expireAt = new Date(Date.now() + 30 * 60 * 1000);
    const order = await this.prisma.order.create({
      data: {
        order_id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        user_id: tokenPayload.user_id,
        session_id: body.session_id,
        sku_id: body.sku_id,
        amount: sku.price_amount,
        discount_amount: 0,
        payable_amount: sku.price_amount,
        pay_status: 'CREATED',
        order_status: 'CREATED',
        source: body.source,
        expired_at: expireAt,
      },
    });

    return {
      order_id: order.order_id,
      amount: Number(order.amount),
      discount_amount: Number(order.discount_amount),
      payable_amount: Number(order.payable_amount),
      pay_status: order.pay_status,
      expire_at: expireAt.toISOString(),
    };
  }
}
