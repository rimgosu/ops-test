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
import { GetUser } from './decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  async getAllUsers(@Req() req) {
    return await this.usersService.getAllUsers(req.user.role);
  }
  
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.register(registerDto);
    return { username: user.username };
  }

  @Post('sendcode')
  sendCode(@GetUser() userToken: User) {
    console.log('userToken in controller = ' + userToken);
    
    // 여기서 @GetUser는 jwt 토큰 자체 정보를 가져옴
    return this.usersService.sendVerificationCode(userToken);
  }

  @Post('confirmcode')
  async confirmCode(@Body('verificationCode') code: string, @GetUser() userToken: User) {
    return { "isVerified": await this.usersService.confirmVerificationCode(code, userToken) };
  }

}
