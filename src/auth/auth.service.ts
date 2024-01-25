import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await this.comparePasswords(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  
  // 비밀번호 해시 생성
  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required for hashing.');
    }
  
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
  

  // 저장된 해시와 비밀번호 비교
  async comparePasswords(password: string, storedPasswordHash: string): Promise<boolean> {

    console.log(password);
    console.log(storedPasswordHash);
    

    if (!password || !storedPasswordHash) {
      throw new Error('Password and hash are required for comparison.');
    }
  
    return bcrypt.compare(password, storedPasswordHash);
  }

}
