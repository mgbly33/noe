import { Module } from '@nestjs/common';

import { OpenAiTarotProvider } from './openai-tarot.provider';

@Module({
  providers: [OpenAiTarotProvider],
  exports: [OpenAiTarotProvider],
})
export class AiModule {}
