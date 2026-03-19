import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts() {
    const items = await this.prisma.productSku.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        sort_no: 'asc',
      },
    });

    return {
      items: items.map((item) => ({
        sku_id: item.sku_id,
        sku_type: item.sku_type,
        reading_type: item.reading_type,
        price: Number(item.price_amount),
        title: item.title,
        benefits: [
          `${item.credit_count} credit(s)`,
          `${item.validity_days} day validity`,
        ],
        status: item.status,
      })),
    };
  }
}
