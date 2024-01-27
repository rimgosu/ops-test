import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async signIn(username: string, pass: string): Promise<{ access_token: string, refresh_token: string }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (user.loginAttempts >= 5) {
      throw new UnauthorizedException('최대 로그인 시도 횟수를 초과하였습니다.');
    }

    if (!(await this.comparePasswords(pass, user.password))) {
      await this.incrementLoginAttempts(user);
      throw new UnauthorizedException('잘못된 비밀번호입니다.');
    }

    await this.resetLoginAttempts(user);
    const { access_token, refresh_token } = await this.createTokens(user);

    return { access_token, refresh_token };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {

    console.log('refreshToken : ' + refreshToken);

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // 'exp' 속성 제거
      delete payload.exp;

      const newAccessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '60s'
      });

      const user = await this.usersService.findByUsername(payload.username);
      user.accessToken = newAccessToken;

      return { access_token: newAccessToken };
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException('Refresh token is invalid');
    }
  }

  async changePassword(username: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const isPasswordValid = await this.comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.usersService.updatePassword(user.id, hashedPassword);
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



  private async incrementLoginAttempts(user: User): Promise<void> {
    user.loginAttempts += 1;
    await this.userRepository.save(user);
  }

  private async resetLoginAttempts(user: User): Promise<void> {
    user.loginAttempts = 0;
    await this.userRepository.save(user);
  }

  private async createTokens(user: User): Promise<{ access_token: string, refresh_token: string }> {
    const payload = { username: user.username, sub: user.id, role: user.role };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '60s'
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d'
    });

    user.refreshToken = refresh_token;
    user.accessToken = access_token;
    await this.userRepository.save(user);

    return { access_token, refresh_token };
  }



}
