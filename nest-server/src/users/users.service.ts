import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { BaseUserDTO, SignUpDTO, UserToSaveDTO } from '../auth/dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Role } from '../common/custom-decorators/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async has(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ email });
    return !!user;
  }

  async get(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async set(user: UserToSaveDTO): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async updateRole(id: string, role: Role): Promise<UpdateResult> {
    const user = await this.userRepository.findOneBy({ _id: id });
    if (!user) throw new UnprocessableEntityException('User not found');
    return await this.userRepository.update({ _id: id }, { role });
  }

  async delete(id: string): Promise<DeleteResult> {
    const user = await this.userRepository.findOneBy({ _id: id });
    if (!user) throw new UnprocessableEntityException('User not found');
    return await this.userRepository.delete({ _id: id });
  }
}
