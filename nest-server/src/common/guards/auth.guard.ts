import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../custom-decorators/skip-auth';
import { Reflector } from '@nestjs/core';
import { EncryptedUser } from '../types/types';
import { Role, ROLES_KEY } from '../custom-decorators/roles';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized: Token missing');
    }
    try {
      const payload = await this.jwtService.verifyAsync<EncryptedUser>(token);
      request['user'] = payload;
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      return requiredRoles.some((role) => payload.role === role);
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message === 'jwt malformed' ? 'Token Expired. Login again' : error.message : 'Unauthorized',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

