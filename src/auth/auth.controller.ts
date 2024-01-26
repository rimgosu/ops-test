import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Patch,
  Req,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from 'src/dto/login.dto';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private usersService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Patch('change-password')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findByUsername(req.user.username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const { currentPassword, newPassword } = changePasswordDto;

    // 현재 비밀번호 확인
    const isPasswordValid = await this.authService.comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 해싱 및 저장
    const hashedPassword = await this.authService.hashPassword(newPassword);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: '비밀번호가 변경되었습니다.' };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string): Promise<{ access_token: string }> {
    return await this.authService.refreshAccessToken(refreshToken);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
