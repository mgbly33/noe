import { Injectable, NotFoundException } from '@nestjs/common';

import { createBusinessId } from '../../common/id';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly assetsService: AssetsService,
  ) {}

  async startMockCheckout(
    authorization: string | undefined,
    body: { order_id: string },
  ) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);

    const order = await this.prisma.order.findFirst({
      where: {
        order_id: body.order_id,
        user_id: tokenPayload.user_id,
      },
    });
    if (!order) {
      throw new NotFoundException('Order does not exist.');
    }

    let transaction = await this.prisma.paymentTransaction.findFirst({
      where: {
        order_id: order.order_id,
      },
    });

    if (!transaction) {
      transaction = await this.prisma.paymentTransaction.create({
        data: {
          transaction_id: createBusinessId('txn'),
          order_id: order.order_id,
          pay_channel: 'mock_pay',
          prepay_id: createBusinessId('prepay'),
          pay_status: 'PAYING',
        },
      });
    }

    await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        pay_status: 'PAYING',
        order_status: 'PAYING',
      },
    });

    return {
      order_id: order.order_id,
      pay_status: 'PAYING',
      checkout_token: transaction.prepay_id,
    };
  }

  async handleMockCallback(body: { order_id: string }) {
    const order = await this.prisma.order.findFirst({
      where: {
        order_id: body.order_id,
      },
    });
    if (!order) {
      throw new NotFoundException('Order does not exist.');
    }

    const existingTransaction = await this.prisma.paymentTransaction.findFirst({
      where: {
        order_id: order.order_id,
      },
    });

    if (existingTransaction?.pay_status !== 'PAID') {
      if (existingTransaction) {
        await this.prisma.paymentTransaction.update({
          where: {
            id: existingTransaction.id,
          },
          data: {
            pay_status: 'PAID',
            paid_amount: order.payable_amount,
            paid_at: new Date(),
            callback_payload: {
              order_id: order.order_id,
              provider: 'mock_pay',
            },
          },
        });
      } else {
        await this.prisma.paymentTransaction.create({
          data: {
            transaction_id: createBusinessId('txn'),
            order_id: order.order_id,
            pay_channel: 'mock_pay',
            third_party_trade_no: createBusinessId('trade'),
            pay_status: 'PAID',
            paid_amount: order.payable_amount,
            paid_at: new Date(),
            callback_payload: {
              order_id: order.order_id,
              provider: 'mock_pay',
            },
          },
        });
      }

      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          pay_status: 'PAID',
          order_status: 'PAID',
          paid_at: new Date(),
        },
      });
    }

    await this.assetsService.grantCreditsFromPaidOrder(order.order_id);

    return {
      order_id: order.order_id,
      pay_status: 'PAID',
    };
  }
}
