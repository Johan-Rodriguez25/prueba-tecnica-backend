import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetTransactionsInput,
  GetTransactionsOutput,
} from './get-transactions.dto';
import { GetTransactionsUseCase } from './get-transactions.use-case';

@ApiTags('transactions')
@Controller({ path: 'transactions', version: '1' })
export class GetTransactionsController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List transactions' })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: 'Filtra por merchantId (exact match).',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'currency', required: false })
  @ApiQuery({ name: 'reference', required: false })
  @ApiQuery({ name: 'createdFrom', required: false })
  @ApiQuery({ name: 'createdTo', required: false })
  @ApiQuery({ name: 'minAmount', required: false })
  @ApiQuery({ name: 'maxAmount', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiOkResponse({ type: GetTransactionsOutput })
  async list(
    @Query() query: GetTransactionsInput,
  ): Promise<GetTransactionsOutput> {
    return this.getTransactionsUseCase.execute(query);
  }
}
