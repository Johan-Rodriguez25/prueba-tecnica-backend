import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetTransactionInput,
  GetTransactionOutput,
} from './get-transaction.dto';
import { GetTransactionUseCase } from './get-transaction.use-case';

@ApiTags('transactions')
@Controller({ path: 'transactions', version: '1' })
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
  ): Promise<GetTransactionOutput> {
    return this.getTransactionUseCase.execute(params);
  }
}
