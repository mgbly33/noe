import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { createBusinessId } from '../../common/id';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async recordOperation(
    input: {
      operator_id: string;
      module_name: string;
      operation_type: string;
      target_id?: string;
      before_snapshot?: Prisma.InputJsonValue | null;
      after_snapshot?: Prisma.InputJsonValue | null;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return client.operationAuditLog.create({
      data: {
        log_id: createBusinessId('audit'),
        operator_id: input.operator_id,
        module_name: input.module_name,
        operation_type: input.operation_type,
        target_id: input.target_id,
        before_snapshot: input.before_snapshot ?? Prisma.JsonNull,
        after_snapshot: input.after_snapshot ?? Prisma.JsonNull,
      },
    });
  }
}
