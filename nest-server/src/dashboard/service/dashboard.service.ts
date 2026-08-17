import { Injectable } from '@nestjs/common';
import { UserResponseDTO } from '../../auth/dto/auth.dto';
import { UsersService } from '../../users/users.service';

@Injectable()
export class DashboardService {
  constructor(private readonly usersService: UsersService) { }

  async getAllUsers(): Promise<UserResponseDTO[]> {
    const all_users = await this.usersService.findAll();
    return all_users.map((user) => ({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      age: user.age,
      role: user.role
    }));
  }

  async getUserByEmail(email: string): Promise<UserResponseDTO | null> {
    const user = await this.usersService.get(email);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      age: user.age,
    };
  }

  getCompanyInfo() {
    return {
      name: 'Tech Solutions Inc.',
      address: '1234 Innovation Drive, Tech City, TX 75001',
      contactEmail: 'contact@techsolutions.com',
    };
  }
}
