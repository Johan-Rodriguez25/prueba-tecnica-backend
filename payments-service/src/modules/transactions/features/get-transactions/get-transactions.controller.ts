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
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ type: GetTransactionsOutput })
  async list(
    @Query() query: GetTransactionsInput,
  ): Promise<GetTransactionsOutput> {
    return this.getTransactionsUseCase.execute(query);
  }
}
