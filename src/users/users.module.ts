import { Module,forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    forwardRef(() => AuthModule), // 순환 의존성 해결
    TypeOrmModule.forFeature([User])
  ],

  providers: [UsersService, EmailService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
