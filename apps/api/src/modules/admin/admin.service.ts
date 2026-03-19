import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  async listReadings(authorization: string | undefined) {
    this.authService.assertAdminAuthorization(authorization);

    const readings = await this.prisma.reading.findMany({
      orderBy: {
        created_at: 'desc',
      },
      take: 100,
    });

    return {
      items: readings.map((reading) => ({
        reading_id: reading.reading_id,
        user_id: reading.user_id,
        session_id: reading.session_id,
        reading_status: reading.reading_status,
        risk_level: reading.risk_level,
        spread_type: reading.spread_type,
        created_at: reading.created_at.toISOString(),
      })),
    };
  }

  async listRiskEvents(authorization: string | undefined) {
    this.authService.assertAdminAuthorization(authorization);

    const events = await this.prisma.riskEvent.findMany({
      orderBy: {
        created_at: 'desc',
      },
      take: 100,
    });

    return {
      items: events.map((event) => ({
        event_id: event.event_id,
        user_id: event.user_id,
        scene: event.scene,
        risk_level: event.risk_level,
        action_taken: event.action_taken,
        created_at: event.created_at.toISOString(),
      })),
    };
  }

  async publishPromptPolicy(
    authorization: string | undefined,
    body: { policy_version: string },
  ) {
    const tokenPayload =
      this.authService.assertAdminAuthorization(authorization);
    const activeBefore = await this.prisma.promptPolicyVersion.findFirst({
      where: {
        status: 'active',
      },
      orderBy: {
        published_at: 'desc',
      },
    });
    const now = new Date();

    const published = await this.prisma.$transaction(async (tx) => {
      await tx.promptPolicyVersion.updateMany({
        where: {
          status: 'active',
        },
        data: {
          status: 'inactive',
        },
      });

      const existing = await tx.promptPolicyVersion.findFirst({
        where: {
          policy_version: body.policy_version,
        },
      });

      const policy = existing
        ? await tx.promptPolicyVersion.update({
            where: {
              id: existing.id,
            },
            data: {
              model_route_code: existing.model_route_code ?? 'mock-provider-v2',
              prompt_template: this.toJsonValue(existing.prompt_template),
              rewrite_policy_version:
                existing.rewrite_policy_version ??
                `${body.policy_version}_rewrite`,
              fallback_policy_version:
                existing.fallback_policy_version ??
                `${body.policy_version}_fallback`,
              gray_scope: this.toJsonValue(existing.gray_scope),
              status: 'active',
              published_at: now,
            },
          })
        : await tx.promptPolicyVersion.create({
            data: {
              policy_version: body.policy_version,
              model_route_code: 'mock-provider-v2',
              prompt_template: {
                system:
                  'You are a calm tarot guide with a newer prompt policy.',
                interpretation_style: 'clear and grounded',
              },
              rewrite_policy_version: `${body.policy_version}_rewrite`,
              fallback_policy_version: `${body.policy_version}_fallback`,
              gray_scope: {
                channels: ['h5'],
              },
              status: 'active',
              published_at: now,
            },
          });

      await this.auditService.recordOperation(
        {
          operator_id: tokenPayload.user_id,
          module_name: 'prompt_policies',
          operation_type: 'publish',
          target_id: policy.policy_version,
          before_snapshot: activeBefore
            ? {
                policy_version: activeBefore.policy_version,
                status: activeBefore.status,
              }
            : null,
          after_snapshot: {
            policy_version: policy.policy_version,
            status: policy.status,
          },
        },
        tx,
      );

      return policy;
    });

    return {
      policy_version: published.policy_version,
      status: published.status,
    };
  }

  private toJsonValue(value: Prisma.JsonValue | null | undefined) {
    if (value === null || value === undefined) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }
}
