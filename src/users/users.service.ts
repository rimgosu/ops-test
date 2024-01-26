import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from './email.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private emailService: EmailService
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
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
  
}
