import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiKeyAuthGuard,
  type AuthenticatedMerchant,
} from '@/auth/api-key-auth.guard';
import { CurrentMerchant } from '@/auth/current-merchant.decorator';
import {
  GetTransactionInput,
  GetTransactionOutput,
} from './get-transaction.dto';
import { GetTransactionUseCase } from './get-transaction.use-case';

@ApiTags('transactions')
@ApiSecurity('api-key')
@Controller({ path: 'transactions', version: '1' })
@UseGuards(ApiKeyAuthGuard)
export class GetTransactionController {
  constructor(private readonly getTransactionUseCase: GetTransactionUseCase) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiParam({
    name: 'id',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiOkResponse({ type: GetTransactionOutput })
  async get(
    @Param() params: GetTransactionInput,
    @CurrentMerchant() merchant: AuthenticatedMerchant,
  ): Promise<GetTransactionOutput> {
    return this.getTransactionUseCase.execute(params, merchant.id);
  }
}
