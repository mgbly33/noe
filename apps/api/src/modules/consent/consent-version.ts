import { InternalServerErrorException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

export const CONSENT_TYPES = [
  'privacy',
  'disclaimer',
  'ai_notice',
  'age_notice',
] as const;

type ConsentType = (typeof CONSENT_TYPES)[number];

export type ConsentVersionMap = {
  privacy_version: string;
  disclaimer_version: string;
  ai_notice_version: string;
  age_notice_version: string;
};

export const getLatestConsentVersions = async (
  prisma: PrismaService,
): Promise<ConsentVersionMap> => {
  const protocols = await prisma.protocolVersion.findMany({
    where: {
      status: 'active',
      protocol_type: {
        in: [...CONSENT_TYPES],
      },
    },
    orderBy: [
      { protocol_type: 'asc' },
      { published_at: 'desc' },
      { created_at: 'desc' },
    ],
  });

  const latestByType = new Map<ConsentType, string>();

  for (const protocol of protocols) {
    const type = protocol.protocol_type as ConsentType;

    if (!latestByType.has(type)) {
      latestByType.set(type, protocol.version);
    }
  }

  const missing = CONSENT_TYPES.filter((type) => !latestByType.has(type));
  if (missing.length > 0) {
    throw new InternalServerErrorException(
      `Missing active protocol versions for: ${missing.join(', ')}`,
    );
  }

  return {
    privacy_version: latestByType.get('privacy')!,
    disclaimer_version: latestByType.get('disclaimer')!,
    ai_notice_version: latestByType.get('ai_notice')!,
    age_notice_version: latestByType.get('age_notice')!,
  };
};
