import { Controller, Get, Query } from '@nestjs/common';
import {
  GetNotificationsQuery,
  GetNotificationsOutput,
} from './get-notifications.dto';
import { GetNotificationsUseCase } from './get-notifications.use-case';

@Controller('notifications')
export class GetNotificationsController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
  ) {}

  @Get()
  async get(
    @Query() query: GetNotificationsQuery,
  ): Promise<GetNotificationsOutput> {
    return this.getNotificationsUseCase.execute(query);
  }
}
