import { Body, Controller, Headers, Post } from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('payments/mock')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  async checkout(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { order_id: string },
  ) {
    return {
      code: 0,
      data: await this.paymentsService.startMockCheckout(authorization, body),
    };
  }

  @Post('callback')
  async callback(@Body() body: { order_id: string }) {
    return {
      code: 0,
      data: await this.paymentsService.handleMockCallback(body),
    };
  }
}
