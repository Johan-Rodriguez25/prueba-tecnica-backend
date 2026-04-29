import { Module } from '@nestjs/common';
import { GenerateSettlementController } from './features/generate-settlement/generate-settlement.controller';
import { GenerateSettlementUseCase } from './features/generate-settlement/generate-settlement.use-case';
import { GetSettlementDetailsController } from './features/get-settlement-details/get-settlement-details.controller';
import { GetSettlementDetailsUseCase } from './features/get-settlement-details/get-settlement-details.use-case';

@Module({
  imports: [],
  controllers: [GenerateSettlementController, GetSettlementDetailsController],
  providers: [GenerateSettlementUseCase, GetSettlementDetailsUseCase],
  exports: [GenerateSettlementUseCase, GetSettlementDetailsUseCase],
})
export class SettlementsModule {}
