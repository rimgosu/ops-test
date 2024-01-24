// app.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';

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
    const user = await this.userService.createUser({
      ...registerDto,
      password: hashedPassword,
    });

    // 응답 반환 (비밀번호 정보는 제외)
    return { id: user.id, email: user.email };
  }

  // @Post('login')
  // async login(@Body() loginData: LoginDto) {
  //   // 로그인 로직
  // }

  @Get()
  async findAll() {
    // 모든 사용자 조회
  }
}
