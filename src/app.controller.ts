// app.controller.ts
import { Controller, Post, Body, Get, UseGuards, Patch, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './jwt-auth.guard'; // JWT 인증 Guard
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('users')
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // 이메일 중복 검사
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await this.authService.hashPassword(registerDto.password);

    // 사용자 정보 저장
    await this.userService.createUser({
      ...registerDto,
      password: hashedPassword,
    });

    // 응답 반환 (비밀번호 정보는 제외)
    return { email: registerDto.email };
  }

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    const user = req.user;
    const { currentPassword, newPassword } = changePasswordDto;

    // 현재 비밀번호 확인
    const isPasswordValid = await this.authService.comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 해싱 및 저장
    const hashedPassword = await this.authService.hashPassword(newPassword);
    await this.userService.updatePassword(user.id, hashedPassword);

    return { message: '비밀번호가 변경되었습니다.' };
  }

  @Get()
  async findAll() {
    // 모든 사용자 조회
    return 'hello world';
  }
}
