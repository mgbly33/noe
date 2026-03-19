import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PromptPolicyProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getActivePolicy() {
    const policy = await this.prisma.promptPolicyVersion.findFirst({
      where: {
        status: 'active',
      },
      orderBy: [
        {
          published_at: 'desc',
        },
        {
          created_at: 'desc',
        },
      ],
    });
    if (!policy) {
      throw new NotFoundException('Active prompt policy does not exist.');
    }

    return policy;
  }
}
