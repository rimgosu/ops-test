import { Module,forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    forwardRef(() => AuthModule), // 순환 의존성 해결
    TypeOrmModule.forFeature([User]),
    // PassportModule과 JwtModule 제거
  ],

  providers: [UsersService, EmailService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
