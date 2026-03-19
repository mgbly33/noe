import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  CONSENT_TYPES,
  ConsentVersionMap,
  getLatestConsentVersions,
} from './consent-version';

type AcceptConsentBody = {
  privacy_version: string;
  disclaimer_version: string;
  ai_notice_version: string;
  age_notice_version: string;
  accepted: boolean;
};

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getLatest() {
    return getLatestConsentVersions(this.prisma);
  }

  async accept(authorization: string | undefined, body: AcceptConsentBody) {
    if (!body.accepted) {
      throw new BadRequestException('Consent must be explicitly accepted.');
    }

    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    const latestVersions = await getLatestConsentVersions(this.prisma);
    this.assertLatestVersions(body, latestVersions);

    const acceptedAt = new Date();

    await this.prisma.consentRecord.createMany({
      data: CONSENT_TYPES.map((consentType) => ({
        consent_id: `consent_${randomUUID().replace(/-/g, '')}`,
        user_id: tokenPayload.user_id,
        consent_type: consentType,
        version: this.getVersionForType(body, consentType),
        accepted: true,
        channel: tokenPayload.channel,
        device_id: tokenPayload.device_id,
        accepted_at: acceptedAt,
      })),
    });

    return {
      accepted: true,
      accepted_at: acceptedAt.toISOString(),
    };
  }

  private assertLatestVersions(
    body: AcceptConsentBody,
    latestVersions: ConsentVersionMap,
  ) {
    const matches =
      body.privacy_version === latestVersions.privacy_version &&
      body.disclaimer_version === latestVersions.disclaimer_version &&
      body.ai_notice_version === latestVersions.ai_notice_version &&
      body.age_notice_version === latestVersions.age_notice_version;

    if (!matches) {
      throw new BadRequestException('Submitted consent versions are stale.');
    }
  }

  private getVersionForType(
    body: AcceptConsentBody,
    consentType: (typeof CONSENT_TYPES)[number],
  ) {
    switch (consentType) {
      case 'privacy':
        return body.privacy_version;
      case 'disclaimer':
        return body.disclaimer_version;
      case 'ai_notice':
        return body.ai_notice_version;
      case 'age_notice':
        return body.age_notice_version;
    }
  }
}
