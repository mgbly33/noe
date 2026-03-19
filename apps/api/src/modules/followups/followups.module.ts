import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RiskModule } from '../risk/risk.module';
import { FollowupsController } from './followups.controller';
import { FollowupsService } from './followups.service';

@Module({
  imports: [AuthModule, RiskModule],
  controllers: [FollowupsController],
  providers: [FollowupsService],
})
export class FollowupsModule {}
