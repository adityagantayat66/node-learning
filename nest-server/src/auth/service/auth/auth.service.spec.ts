import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
            verifyAsync: jest.fn().mockResolvedValue({ email: 'test@mail.com', role: 'User' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'ADMIN_EMAIL') return 'admin@mail.com';
              if (key === 'ADMIN_PASSWORD') return 'qwerty';
              return defaultValue;
            }),
            getOrThrow: jest.fn((key: string) => {
              if (key === 'ADMIN_EMAIL') return 'admin@mail.com';
              if (key === 'ADMIN_PASSWORD') return 'qwerty';
              throw new Error(`Missing key ${key}`);
            }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            has: jest.fn().mockReturnValue(false),
            get: jest.fn().mockReturnValue(undefined),
            set: jest.fn(),
            findAll: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

