import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
        status: {
          in: ['available', 'locked'],
        },
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

  async lockAssetForOrder(
    userId: string,
    sourceOrderId: string,
    readingId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const asset = await client.entitlementAsset.findFirst({
      where: {
        user_id: userId,
        source_order_id: sourceOrderId,
        available_count: {
          gt: 0,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    if (!asset) {
      throw new BadRequestException('No available entitlement asset exists.');
    }

    const nextAvailableCount = asset.available_count - 1;
    const nextLockedCount = asset.locked_count + 1;
    const updatedAsset = await client.entitlementAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        available_count: {
          decrement: 1,
        },
        locked_count: {
          increment: 1,
        },
        status: this.resolveStatus(nextAvailableCount, nextLockedCount),
      },
    });

    await client.entitlementConsumeLog.create({
      data: {
        log_id: createBusinessId('assetlog'),
        asset_id: asset.asset_id,
        user_id: asset.user_id,
        reading_id: readingId,
        action_type: 'lock',
        change_count: 1,
        before_count: asset.available_count,
        after_count: nextAvailableCount,
        remark: `Locked for ${readingId}`,
      },
    });

    return updatedAsset;
  }

  async consumeLockedAsset(
    userId: string,
    assetId: string,
    readingId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const asset = await client.entitlementAsset.findFirst({
      where: {
        asset_id: assetId,
        user_id: userId,
      },
    });
    if (!asset) {
      throw new NotFoundException('Entitlement asset does not exist.');
    }
    if (asset.locked_count < 1) {
      throw new BadRequestException('No locked entitlement asset exists.');
    }

    const nextLockedCount = asset.locked_count - 1;
    const updatedAsset = await client.entitlementAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        locked_count: {
          decrement: 1,
        },
        consumed_count: {
          increment: 1,
        },
        status: this.resolveStatus(asset.available_count, nextLockedCount),
      },
    });

    await client.entitlementConsumeLog.create({
      data: {
        log_id: createBusinessId('assetlog'),
        asset_id: asset.asset_id,
        user_id: asset.user_id,
        reading_id: readingId,
        action_type: 'consume',
        change_count: 1,
        before_count: asset.locked_count,
        after_count: nextLockedCount,
        remark: `Consumed for ${readingId}`,
      },
    });

    return updatedAsset;
  }

  async releaseLockedAsset(
    userId: string,
    assetId: string,
    readingId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const asset = await client.entitlementAsset.findFirst({
      where: {
        asset_id: assetId,
        user_id: userId,
      },
    });
    if (!asset) {
      throw new NotFoundException('Entitlement asset does not exist.');
    }
    if (asset.locked_count < 1) {
      return asset;
    }

    const nextAvailableCount = asset.available_count + 1;
    const nextLockedCount = asset.locked_count - 1;
    const updatedAsset = await client.entitlementAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        available_count: {
          increment: 1,
        },
        locked_count: {
          decrement: 1,
        },
        status: this.resolveStatus(nextAvailableCount, nextLockedCount),
      },
    });

    await client.entitlementConsumeLog.create({
      data: {
        log_id: createBusinessId('assetlog'),
        asset_id: asset.asset_id,
        user_id: asset.user_id,
        reading_id: readingId,
        action_type: 'release',
        change_count: 1,
        before_count: asset.locked_count,
        after_count: nextLockedCount,
        remark: `Released for ${readingId}`,
      },
    });

    return updatedAsset;
  }

  private resolveStatus(availableCount: number, lockedCount: number) {
    if (lockedCount > 0 && availableCount === 0) {
      return 'locked';
    }
    if (availableCount === 0 && lockedCount === 0) {
      return 'consumed';
    }

    return 'available';
  }
}
