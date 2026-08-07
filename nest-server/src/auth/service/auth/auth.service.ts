import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BaseUserDTO,
  SignInDTO,
  SignUpDTO,
  UserResponseDTO,
} from '../../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../../common/custom-decorators/roles';

@Injectable()
export class AuthService {
  private readonly users = new Map<string, BaseUserDTO>();

  constructor(private jwtService: JwtService) {}

  async signIn(payload: SignInDTO): Promise<{ token: string; role: Role }> {
    const isAdmin = payload.email.includes('admin');
    const role = isAdmin ? Role.Admin : Role.User;
    let isMatch = false;

    if (isAdmin) {
      isMatch =
        payload.email === 'admin@mail.com' && payload.password === 'qwerty';
    } else if (this.users.has(payload.email)) {
      const hash = this.users.get(payload.email)?.password || '';
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
    if (this.users.has(payload.email)) {
      throw new UnprocessableEntityException('Email Already Registered');
    }
    const { email, fullName, age, password } = payload;
    const _id = crypto.randomUUID();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    this.users.set(email, {
      email,
      fullName,
      age,
      password: hashedPassword,
      _id,
    });

    return 'User Registered';
  }

  getAllUsers(): UserResponseDTO[] {
    return Array.from(this.users.values()).map((user) => ({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      age: user.age,
    }));
  }

  getUserByEmail(email: string): UserResponseDTO | null {
    const user = this.users.get(email);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      age: user.age,
    };
  }
}

