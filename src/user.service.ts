// user.service.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }


  async createUser(userData: any): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }


  // 기타 메서드...
}
