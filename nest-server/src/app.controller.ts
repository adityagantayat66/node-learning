import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request } from 'express';
import { Role, Roles } from './common/custom-decorators/roles';

@Roles(Role.User)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Req() req?: Request): string {
    console.log(req?.['user']);
    return this.appService.getHello();
  }
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
    };
  }
}

