import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithMerchant } from './api-key-auth.guard';

export const CurrentMerchant = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithMerchant>();

    if (!request.merchant) {
      throw new UnauthorizedException('merchant is not available in request');
    }

    return request.merchant;
  },
);
