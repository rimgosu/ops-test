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
    await this.authService.changePassword(req.user.username, changePasswordDto.currentPassword, changePasswordDto.newPassword);
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
