import { Module } from '@nestjs/common';

import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { DrawService } from './draw.service';
import { GenerationService } from './generation.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { PromptPolicyProvider } from './providers/prompt-policy.provider';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';

@Module({
  imports: [AuthModule, AssetsModule],
  controllers: [ReadingsController],
  providers: [
    ReadingsService,
    DrawService,
    GenerationService,
    PromptPolicyProvider,
    MockAiProvider,
  ],
  exports: [ReadingsService, PromptPolicyProvider],
})
export class ReadingsModule {}
