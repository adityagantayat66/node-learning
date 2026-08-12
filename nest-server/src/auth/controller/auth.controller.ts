import { Body, Controller, Post } from '@nestjs/common';
import { SignInDTO, SignUpDTO } from '../dto/auth.dto';
import { AuthService } from '../service/auth/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { SkipAuth } from '../../common/custom-decorators/skip-auth';
import { Role } from '../../common/custom-decorators/roles';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'This endpoint is for signing in the user' })
  @SkipAuth()
  @Post('signin')
  async signIn(
    @Body() payload: SignInDTO,
  ): Promise<{ token: string; role: Role }> {
    return this.authService.signIn(payload);
  }

  @ApiOperation({ summary: 'This endpoint is for registering the user' })
  @SkipAuth()
  @Post('signup')
  async signUp(@Body() payload: SignUpDTO): Promise<string> {
    return this.authService.signUp(payload);
  }
}

