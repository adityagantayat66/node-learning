import { Injectable } from '@nestjs/common';
import { BaseUserDTO } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, BaseUserDTO>();

  has(email: string): boolean {
    return this.users.has(email);
  }

  get(email: string): BaseUserDTO | undefined {
    return this.users.get(email);
  }

  set(email: string, user: BaseUserDTO): void {
    this.users.set(email, user);
  }

  findAll(): BaseUserDTO[] {
    return Array.from(this.users.values());
  }
}
