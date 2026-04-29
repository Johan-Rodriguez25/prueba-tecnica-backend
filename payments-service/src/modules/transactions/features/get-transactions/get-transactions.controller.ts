import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiKeyAuthGuard,
  type AuthenticatedMerchant,
} from '@/auth/api-key-auth.guard';
import { CurrentMerchant } from '@/auth/current-merchant.decorator';
import {
  GetTransactionsInput,
  GetTransactionsOutput,
} from './get-transactions.dto';
import { GetTransactionsUseCase } from './get-transactions.use-case';

@ApiTags('transactions')
@ApiSecurity('api-key')
@Controller({ path: 'transactions', version: '1' })
@UseGuards(ApiKeyAuthGuard)
export class GetTransactionsController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List transactions' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ type: GetTransactionsOutput })
  async list(
    @Query() query: GetTransactionsInput,
    @CurrentMerchant() merchant: AuthenticatedMerchant,
  ): Promise<GetTransactionsOutput> {
    return this.getTransactionsUseCase.execute(query, merchant.id);
  }
}
