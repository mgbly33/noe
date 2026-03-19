import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './modules/assets/assets.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ConsentModule } from './modules/consent/consent.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { QuestionSessionModule } from './modules/question-session/question-session.module';
import { RiskModule } from './modules/risk/risk.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConsentModule,
    RiskModule,
    CatalogModule,
    OrdersModule,
    PaymentsModule,
    AssetsModule,
    QuestionSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
