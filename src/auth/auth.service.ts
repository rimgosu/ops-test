import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<{ access_token: string, refresh_token: string }> {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await this.comparePasswords(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d'  // Refresh 토큰 유효기간 설정
    });

    // refresh token 업데이트
    user.refreshToken = refresh_token;
    await this.userRepository.save(user);

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {

    console.log('refreshToken : ' + refreshToken);
    
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const newAccessToken = await this.jwtService.signAsync(payload);
      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token is invalid');
    }
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
