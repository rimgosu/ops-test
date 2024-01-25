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

  async sendVerificationCode(user: User): Promise<void> {
    const code = 'verifycode'; /* 인증 코드 생성 로직 */
    user.verificationCode = code;
    
    console.log(user);
    

    await this.userRepository.save(user);
    await this.emailService.sendVerificationToEmail(user.username, code);
  }
  
  async confirmVerificationCode(code: string, user: User) {
    // 인증 코드 확인 로직
  }
}
