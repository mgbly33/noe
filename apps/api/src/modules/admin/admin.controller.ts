import { Body, Controller, Get, Headers, Post } from '@nestjs/common';

import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('readings')
  async listReadings(
    @Headers('authorization') authorization: string | undefined,
  ) {
    return {
      code: 0,
      data: await this.adminService.listReadings(authorization),
    };
  }

  @Get('risk-events')
  async listRiskEvents(
    @Headers('authorization') authorization: string | undefined,
  ) {
    return {
      code: 0,
      data: await this.adminService.listRiskEvents(authorization),
    };
  }

  @Post('prompt-policies/publish')
  async publishPromptPolicy(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { policy_version: string },
  ) {
    return {
      code: 0,
      data: await this.adminService.publishPromptPolicy(authorization, body),
    };
  }
}
