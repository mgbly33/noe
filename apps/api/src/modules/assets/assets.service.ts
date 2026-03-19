import { Injectable, NotFoundException } from '@nestjs/common';

import { createBusinessId } from '../../common/id';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getBalance(authorization: string | undefined) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);

    const assets = await this.prisma.entitlementAsset.findMany({
      where: {
        user_id: tokenPayload.user_id,
        status: 'available',
      },
    });

    return {
      total_available_count: assets.reduce(
        (sum, asset) => sum + asset.available_count,
        0,
      ),
      total_locked_count: assets.reduce(
        (sum, asset) => sum + asset.locked_count,
        0,
      ),
      items: assets.map((asset) => ({
        asset_id: asset.asset_id,
        available_count: asset.available_count,
        locked_count: asset.locked_count,
        source_order_id: asset.source_order_id,
      })),
    };
  }

  async grantCreditsFromPaidOrder(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        order_id: orderId,
      },
    });
    if (!order) {
      throw new NotFoundException('Order does not exist.');
    }

    const existingAsset = await this.prisma.entitlementAsset.findFirst({
      where: {
        source_order_id: orderId,
      },
    });
    if (existingAsset) {
      return existingAsset;
    }

    const sku = await this.prisma.productSku.findFirst({
      where: {
        sku_id: order.sku_id,
      },
    });
    if (!sku) {
      throw new NotFoundException('SKU does not exist.');
    }

    const expiredAt = new Date(
      Date.now() + sku.validity_days * 24 * 60 * 60 * 1000,
    );

    const asset = await this.prisma.entitlementAsset.create({
      data: {
        asset_id: createBusinessId('ast'),
        user_id: order.user_id,
        source_order_id: orderId,
        total_count: sku.credit_count,
        available_count: sku.credit_count,
        locked_count: 0,
        consumed_count: 0,
        expired_at: expiredAt,
        status: 'available',
      },
    });

    await this.prisma.entitlementConsumeLog.create({
      data: {
        log_id: createBusinessId('assetlog'),
        asset_id: asset.asset_id,
        user_id: asset.user_id,
        action_type: 'grant',
        change_count: sku.credit_count,
        before_count: 0,
        after_count: sku.credit_count,
        remark: `Granted from ${orderId}`,
      },
    });

    return asset;
  }
}
