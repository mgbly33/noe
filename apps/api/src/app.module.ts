import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ConsentModule } from './modules/consent/consent.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { HistoryModule } from './modules/history/history.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { QuestionSessionModule } from './modules/question-session/question-session.module';
import { ReadingsModule } from './modules/readings/readings.module';
import { RiskModule } from './modules/risk/risk.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    ConsentModule,
    RiskModule,
    CatalogModule,
    AdminModule,
    OrdersModule,
    PaymentsModule,
    AssetsModule,
    QuestionSessionModule,
    HistoryModule,
    ReadingsModule,
    FollowupsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
  ],
})
export class AppModule {}
