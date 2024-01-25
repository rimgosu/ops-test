// src/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/entities/user.entity';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @Transform(({ value }) => value || UserRole.MEMBER)
  role: UserRole = UserRole.MEMBER;
}
