import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import { DashboardService } from './service/dashboard.service';
import { Role, Roles } from '../common/custom-decorators/roles';
import { EncryptedUser } from '../common/types/types';
import { UsersService } from '../users/users.service';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'This endpoint is for getting user details' })
  @Get('getUserDetails')
  async getUserDetails(@Req() req: Request): Promise<UserResponseDTO[]> {
    if (!req['user']) {
      throw new UnauthorizedException('User not authenticated');
    }
    const user: EncryptedUser = req['user'] as EncryptedUser;
    if (user.role === Role.Admin) {
      return this.dashboardService.getAllUsers(user.email);
    }
    const singleUser = await this.dashboardService.getUserByEmail(user.email);
    return singleUser ? [singleUser] : [];
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: 'This endpoint is for checking company details' })
  @Get('companyInfo')
  getCompanyInfo() {
    return this.dashboardService.getCompanyInfo();
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: 'This endpoint is for updating user role' })
  @Patch('updateRole')
  updateRole(
    @Body() body: { id: string; role: number },
  ): Promise<UpdateResult> {
    return this.usersService.updateRole(
      body.id,
      body.role === 0 ? Role.User : Role.Admin,
    );
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: 'This endpoint is for deleting user' })
  @Delete('delete/:id')
  deleteUser(@Param('id') id: string): Promise<DeleteResult> {
    return this.usersService.delete(id);
  }
}
