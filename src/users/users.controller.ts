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
    UseGuards,
  } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from 'src/dto/register.dto';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { User, UserRole } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService,
              private authService: AuthService) {}

  @Get()
  async getAllUsers(@Req() req) {
    // 사용자 역할 확인
    console.log(req.user.role)
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

  @Post('/sendcode')
  sendCode(@GetUser() user: User) {
    // 여기서 보내는 user: jwt 토큰에 담겨있는 user 정보임.
    return this.usersService.sendVerificationCode(user);
  }

  @Post('/confirmcode')
  confirmCode(@Body('verificationCode') code: string, @GetUser() user: User) {
    return this.usersService.confirmVerificationCode(code, user);
  }

}
  