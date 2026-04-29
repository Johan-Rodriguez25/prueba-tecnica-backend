import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiKeyAuthGuard,
  type AuthenticatedMerchant,
} from '@/auth/api-key-auth.guard';
import { CurrentMerchant } from '@/auth/current-merchant.decorator';
import {
  CreateTransactionInput,
  CreateTransactionOutput,
} from './create-transaction.dto';
import { CreateTransactionUseCase } from './create-transaction.use-case';

@ApiTags('transactions')
@ApiSecurity('api-key')
@Controller({ path: 'transactions', version: '1' })
@UseGuards(ApiKeyAuthGuard)
export class CreateTransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  @ApiBody({ type: CreateTransactionInput })
  @ApiCreatedResponse({ type: CreateTransactionOutput })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreateTransactionInput,
    @CurrentMerchant() merchant: AuthenticatedMerchant,
  ): Promise<CreateTransactionOutput> {
    if (body.merchantId !== merchant.id) {
      throw new ForbiddenException(
        'merchantId does not match api key merchant',
      );
    }
    return this.createTransactionUseCase.execute(body);
  }
}
