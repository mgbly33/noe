import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { QuestionSessionController } from './question-session.controller';
import { QuestionSessionService } from './question-session.service';
import { RiskModule } from '../risk/risk.module';

@Module({
  imports: [AuthModule, RiskModule, CatalogModule],
  controllers: [QuestionSessionController],
  providers: [QuestionSessionService],
})
export class QuestionSessionModule {}
