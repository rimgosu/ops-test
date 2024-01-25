import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Request,
    UnauthorizedException,
  } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from 'src/dto/register.dto';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserRole } from 'src/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService,
              private authService: AuthService) {}

  @Get('userlist')
  async getAllUsers(@Req() req) {
    // 사용자 역할 확인
    if (req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('관리자만 접근 가능합니다.');
    }

    // 모든 사용자 목록 조회
    const users = await this.usersService.findAll();
    return users;
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
      // 이메일 중복 검사
      const existingUser = await this.usersService.findByUsername(registerDto.username);
      if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
      }

      // 비밀번호 해싱
      const hashedPassword = await this.authService.hashPassword(registerDto.password);

      // 사용자 정보 저장
      await this.usersService.createUser({
      ...registerDto,
      password: hashedPassword,
      });

      // 응답 반환 (비밀번호 정보는 제외)
      return { username: registerDto.username };
  }

}
  