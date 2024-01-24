import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService // UserService 주입
  ) {}

  // 사용자 검증 로직
  async validateUser(username: string, pass: string): Promise<any> {
    // 여기에 사용자 검증 로직을 구현합니다.
    // 예: 데이터베이스에서 사용자 정보를 조회하고 비밀번호를 비교합니다.
  }

  // 로그인 로직
  async login(loginData: LoginDto) {
    const { email, password } = loginData;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const isPasswordValid = await this.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new Error('잘못된 비밀번호입니다.');
    }

    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
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
    return bcrypt.compare(password, storedPasswordHash);
  }
}
