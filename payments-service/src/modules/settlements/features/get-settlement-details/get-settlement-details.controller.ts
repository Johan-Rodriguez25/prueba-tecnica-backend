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
  GetSettlementDetailsOutput,
  GetSettlementDetailsParams,
} from './get-settlement-details.dto';
import { GetSettlementDetailsUseCase } from './get-settlement-details.use-case';

@ApiTags('settlements')
@ApiSecurity('api-key')
@Controller({ path: 'settlements', version: '1' })
@UseGuards(ApiKeyAuthGuard)
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
    @CurrentMerchant() merchant: AuthenticatedMerchant,
  ): Promise<GetSettlementDetailsOutput> {
    return this.getSettlementDetailsUseCase.execute(params, merchant.id);
  }
}
