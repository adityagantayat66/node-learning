import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  Min,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/custom-decorators/roles';

export class SignInDTO {
  @ApiProperty({ example: 'adi@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;
}

export class SignUpDTO {
  @ApiProperty({ example: 'Aditya' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  age: number;

  @ApiProperty({ example: 'adi@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class BaseUserDTO extends SignUpDTO {
  @ApiProperty()
  _id: string;
}

export class UserResponseDTO {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  age: number;

  @ApiProperty({ enum: Role, required: false })
  role?: Role;
}

