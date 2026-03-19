import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import jwt, { JwtPayload } from 'jsonwebtoken';

import { loadEnv } from '../../common/load-env';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CONSENT_TYPES,
  ConsentVersionMap,
  getLatestConsentVersions,
} from '../consent/consent-version';

loadEnv();

type LoginRequest = {
  login_type: string;
  device_id?: string;
  channel?: string;
  login_name?: string;
  password?: string;
};

type AccessTokenPayload = JwtPayload & {
  user_id: string;
  role: string;
  channel: string;
  device_id?: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(body: LoginRequest) {
    if (body.login_type === 'local_admin') {
      return this.loginLocalAdmin(body);
    }

    if (body.login_type !== 'guest') {
      throw new BadRequestException('Unsupported login type.');
    }
    if (!body.device_id || !body.channel) {
      throw new BadRequestException(
        'Guest login requires device_id and channel.',
      );
    }

    let user = await this.prisma.user.findFirst({
      where: {
        login_type: 'guest',
        device_id: body.device_id,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          user_id: this.createBusinessId('usr'),
          login_type: 'guest',
          role: 'guest',
          device_id: body.device_id,
          channel: body.channel,
          register_time: new Date(),
          status: 'active',
        },
      });
    }

    return {
      user_id: user.user_id,
      token: this.signAccessToken({
        user_id: user.user_id,
        role: user.role,
        channel: body.channel,
        device_id: body.device_id,
      }),
      need_consent: await this.needsConsentByUserId(user.user_id),
      role: user.role,
    };
  }

  async assertUserHasLatestConsent(userId: string) {
    if (await this.needsConsentByUserId(userId)) {
      throw new ForbiddenException(
        'Consent must be accepted before continuing.',
      );
    }
  }

  assertAdminAuthorization(authorization?: string) {
    const tokenPayload = this.verifyAuthorizationHeader(authorization);
    if (!['admin', 'super_admin'].includes(tokenPayload.role)) {
      throw new ForbiddenException('Admin access is required.');
    }

    return tokenPayload;
  }

  verifyAuthorizationHeader(authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const token = authorization.slice('Bearer '.length).trim();

    try {
      return jwt.verify(token, this.getJwtSecret()) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid bearer token.');
    }
  }

  private signAccessToken(payload: AccessTokenPayload) {
    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: '7d',
      subject: payload.user_id,
    });
  }

  private async loginLocalAdmin(body: LoginRequest) {
    if (!body.login_name || !body.password) {
      throw new BadRequestException(
        'Admin login requires login_name and password.',
      );
    }

    const admin = await this.prisma.user.findFirst({
      where: {
        login_type: 'local_admin',
        login_name: body.login_name,
        password_hash: body.password,
        status: 'active',
      },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    return {
      user_id: admin.user_id,
      token: this.signAccessToken({
        user_id: admin.user_id,
        role: admin.role,
        channel: body.channel ?? admin.channel,
      }),
      need_consent: false,
      role: admin.role,
    };
  }

  private getJwtSecret() {
    return process.env.JWT_SECRET ?? 'replace-me';
  }

  private createBusinessId(prefix: string) {
    return `${prefix}_${randomUUID().replace(/-/g, '')}`;
  }

  private async needsConsentByUserId(userId: string) {
    const latestVersions = await getLatestConsentVersions(this.prisma);
    const acceptedRecords = await this.prisma.consentRecord.findMany({
      where: {
        user_id: userId,
        accepted: true,
        consent_type: {
          in: [...CONSENT_TYPES],
        },
      },
      orderBy: {
        accepted_at: 'desc',
      },
    });

    return CONSENT_TYPES.some((consentType) => {
      const expectedVersion = this.getVersionForType(
        latestVersions,
        consentType,
      );
      return !acceptedRecords.some(
        (record) =>
          record.consent_type === consentType &&
          record.version === expectedVersion,
      );
    });
  }

  private getVersionForType(
    versionMap: ConsentVersionMap,
    consentType: (typeof CONSENT_TYPES)[number],
  ) {
    switch (consentType) {
      case 'privacy':
        return versionMap.privacy_version;
      case 'disclaimer':
        return versionMap.disclaimer_version;
      case 'ai_notice':
        return versionMap.ai_notice_version;
      case 'age_notice':
        return versionMap.age_notice_version;
    }
  }
}
