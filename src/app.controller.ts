// app.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('users')
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: RegisterDto) {
    // 회원가입 로직
  }

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    // 로그인 로직
  }

  @Get()
  async findAll() {
    // 모든 사용자 조회
  }
}
