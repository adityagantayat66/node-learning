import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import { DashboardService } from './service/dashboard.service';
import { Role, Roles } from '../common/custom-decorators/roles';
import { EncryptedUser } from '../common/types/types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @ApiOperation({ summary: 'This endpoint is for getting user details' })
  @Get('getUserDetails')
  getUserDetails(@Req() req: Request): UserResponseDTO[] {
    if (!req['user']) {
      throw new UnauthorizedException('User not authenticated');
    }
    const user: EncryptedUser = req['user'] as EncryptedUser;
    if (user.role === Role.Admin) {
      return this.dashboardService.getAllUsers();
    }
    const singleUser = this.dashboardService.getUserByEmail(user.email);
    return singleUser ? [singleUser] : [];
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: 'This endpoint is for checking company details' })
  @Get('companyInfo')
  getCompanyInfo() {
    return this.dashboardService.getCompanyInfo();
  }
}

