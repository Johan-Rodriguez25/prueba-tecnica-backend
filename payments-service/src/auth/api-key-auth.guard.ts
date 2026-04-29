import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MerchantStatus } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '@/prisma/prisma.service';

export type AuthenticatedMerchant = {
  id: string;
  name: string;
  email: string;
  status: MerchantStatus;
  created_at: Date;
  updated_at: Date;
};

export type RequestWithMerchant = Request & {
  merchant: AuthenticatedMerchant;
};

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader = request.header('x-api-key')?.trim();

    if (!apiKeyHeader) {
      throw new UnauthorizedException('x-api-key header is required');
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { api_key: apiKeyHeader },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!merchant) {
      throw new UnauthorizedException('invalid api key');
    }

    if (merchant.status !== MerchantStatus.active) {
      throw new ForbiddenException('merchant is inactive');
    }

    (request as RequestWithMerchant).merchant = merchant;
    return true;
  }
}
