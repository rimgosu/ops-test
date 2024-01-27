import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { RegisterDto } from 'src/dto/register.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private emailService: EmailService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { refreshToken } });
  }


  async createUser(userData: any): Promise<void> {
    const user = this.userRepository.create(userData);
    await this.userRepository.save(user);
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: newPassword });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async sendVerificationCode(userToken: User): Promise<void> {

    console.log('userToken = '+ userToken);
    

    const code = Math.random().toString(36).substring(2, 10);

    // 유저 정보 가져오기
    const user = await this.findByUsername(userToken.username);

    user.verificationCode = code;
    
    console.log(user);
    

    await this.userRepository.save(user);
    await this.emailService.sendVerificationToEmail(user.username, code);
  }
  
  async confirmVerificationCode(code: string, userToken: User): Promise<boolean> {

    const user = await this.findByUsername(userToken.username);

    // user 객체에서 verificationCode 필드를 검사
    if (user.verificationCode === code) {
      // 코드가 일치하면 사용자의 인증 상태 업데이트
      user.isVerified = true;

      await this.userRepository.save(user);
      return true; // 인증 성공
    } else {
      return false; // 인증 실패
    }
  }

  async getAllUsers(userRole: string): Promise<User[]> {
    if (userRole !== UserRole.ADMIN) {
      throw new UnauthorizedException('관리자만 접근 가능합니다.');
    }

    return await this.userRepository.find();
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, password } = registerDto;

    // 이메일 중복 검사
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await this.authService.hashPassword(password);

    // 사용자 정보 저장
    const newUser = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return newUser;
  }
  
}
