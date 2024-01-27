import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private usersService: UsersService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findByUsername(payload.username);
    if (user.accessToken !== token) {
      throw new UnauthorizedException();
    }

    const currentRoute = request.route.path; // 현재 요청 경로를 얻음

    // sendcode, confirmcode 경로에 대한 특별 처리
    if ((currentRoute === '/users/sendcode' || currentRoute === '/users/confirmcode') && !user.isVerified) {
      request['user'] = user;
      return true;
    }

    if (!user.isVerified) {
      throw new UnauthorizedException();
    }

    request['user'] = payload;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
