import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { randomUUID } from 'node:crypto';

import jwt, { JwtPayload } from 'jsonwebtoken';

import { loadEnv } from '../../common/load-env';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CONSENT_TYPES,
  ConsentVersionMap,
  getLatestConsentVersions,
} from '../consent/consent-version';
import { hashPassword, verifyPassword } from './password';

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

type AuthSession = {
  user_id: string;
  token: string;
  need_consent: boolean;
  role: string;
  login_name: string | null;
  login_type: string | null;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(body: LoginRequest) {
    if (body.login_type !== 'local') {
      throw new BadRequestException('Unsupported login type.');
    }
    if (!body.login_name || !body.password || !body.channel) {
      throw new BadRequestException(
        'Local registration requires login_name, password, and channel.',
      );
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        login_name: body.login_name,
        is_deleted: false,
      },
    });

    if (existing) {
      throw new BadRequestException('Login name already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        user_id: this.createBusinessId('usr'),
        login_type: 'local',
        login_name: body.login_name,
        password_hash: hashPassword(body.password),
        role: 'user',
        channel: body.channel,
        register_time: new Date(),
        status: 'active',
      },
    });

    return this.buildAuthSession(user, body.channel);
  }

  async login(body: LoginRequest) {
    if (body.login_type === 'local') {
      return this.loginLocal(body);
    }

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

    return this.buildAuthSession(user, body.channel, body.device_id);
  }

  async me(authorization?: string) {
    const tokenPayload = this.verifyAuthorizationHeader(authorization);
    const user = await this.prisma.user.findFirst({
      where: {
        user_id: tokenPayload.user_id,
        status: 'active',
        is_deleted: false,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid bearer token.');
    }

    return {
      user_id: user.user_id,
      role: user.role,
      login_name: user.login_name ?? null,
      login_type: user.login_type ?? null,
      need_consent: ['admin', 'super_admin'].includes(user.role)
        ? false
        : await this.needsConsentByUserId(user.user_id),
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

  private async loginLocal(body: LoginRequest) {
    if (!body.login_name || !body.password || !body.channel) {
      throw new BadRequestException(
        'Local login requires login_name, password, and channel.',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        login_type: {
          in: ['local', 'local_admin'],
        },
        login_name: body.login_name,
        status: 'active',
        is_deleted: false,
      },
    });

    if (
      !user?.password_hash ||
      !verifyPassword(body.password, user.password_hash)
    ) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthSession(user, body.channel);
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
        status: 'active',
        is_deleted: false,
      },
    });

    if (
      !admin?.password_hash ||
      !verifyPassword(body.password, admin.password_hash)
    ) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthSession(admin, body.channel ?? admin.channel);
  }

  private getJwtSecret() {
    return process.env.JWT_SECRET ?? 'replace-me';
  }

  private createBusinessId(prefix: string) {
    return `${prefix}_${randomUUID().replace(/-/g, '')}`;
  }

  private async buildAuthSession(
    user: User,
    channel: string,
    deviceId?: string,
  ): Promise<AuthSession> {
    return {
      user_id: user.user_id,
      token: this.signAccessToken({
        user_id: user.user_id,
        role: user.role,
        channel,
        ...(deviceId ? { device_id: deviceId } : {}),
      }),
      need_consent: ['admin', 'super_admin'].includes(user.role)
        ? false
        : await this.needsConsentByUserId(user.user_id),
      role: user.role,
      login_name: user.login_name ?? null,
      login_type: user.login_type ?? null,
    };
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
