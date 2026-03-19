import { Body, Controller, Headers, Post } from '@nestjs/common';

import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  async createOrder(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      session_id: string;
      sku_id: string;
      source?: string;
    },
  ) {
    return {
      code: 0,
      data: await this.ordersService.createOrder(authorization, body),
    };
  }
}
