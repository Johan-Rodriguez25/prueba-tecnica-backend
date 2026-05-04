import { Controller, Get, Param } from '@nestjs/common';
import {
  GetNotificationParams,
  GetNotificationOutput,
} from './get-notification.dto';
import { GetNotificationUseCase } from './get-notification.use-case';

@Controller('notifications')
export class GetNotificationController {
  constructor(
    private readonly getNotificationUseCase: GetNotificationUseCase,
  ) {}

  @Get(':id')
  async get(
    @Param() params: GetNotificationParams,
  ): Promise<GetNotificationOutput> {
    return this.getNotificationUseCase.execute(params);
  }
}
