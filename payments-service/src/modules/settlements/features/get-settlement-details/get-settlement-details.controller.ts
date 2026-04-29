import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetSettlementDetailsOutput,
  GetSettlementDetailsParams,
} from './get-settlement-details.dto';
import { GetSettlementDetailsUseCase } from './get-settlement-details.use-case';

@ApiTags('settlements')
@Controller({ path: 'settlements', version: '1' })
export class GetSettlementDetailsController {
  constructor(
    private readonly getSettlementDetailsUseCase: GetSettlementDetailsUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get settlement details' })
  @ApiParam({
    name: 'id',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiOkResponse({ type: GetSettlementDetailsOutput })
  async get(
    @Param() params: GetSettlementDetailsParams,
  ): Promise<GetSettlementDetailsOutput> {
    return this.getSettlementDetailsUseCase.execute(params);
  }
}
