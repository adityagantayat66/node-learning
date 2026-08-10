import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  SignInDTO,
  SignUpDTO,
} from '../../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../common/custom-decorators/roles';

import { UsersService } from '../../../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) { }

  async signIn(payload: SignInDTO): Promise<{ token: string; role: Role }> {
    const adminEmail = this.configService.getOrThrow<string>('ADMIN_EMAIL');
    const adminPassword =
      this.configService.getOrThrow<string>('ADMIN_PASSWORD');

    const isAdmin =
      payload.email === adminEmail || payload.email.includes('admin');
    const role = isAdmin ? Role.Admin : Role.User;
    let isMatch = false;

    if (isAdmin) {
      isMatch =
        payload.email === adminEmail && payload.password === adminPassword;
    } else if (this.usersService.has(payload.email)) {
      const hash = this.usersService.get(payload.email)?.password || '';
      isMatch = await bcrypt.compare(payload.password, hash);
    }

    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = await this.jwtService.signAsync({
      email: payload.email,
      role,
    });

    return { token, role };
  }

  async signUp(payload: SignUpDTO): Promise<string> {
    if (this.usersService.has(payload.email)) {
      throw new UnprocessableEntityException('Email Already Registered');
    }
    const { email, fullName, age, password } = payload;
    const _id = crypto.randomUUID();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    this.usersService.set(email, {
      email,
      fullName,
      age,
      password: hashedPassword,
      _id,
    });

    return 'User Registered';
  }
}

