import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
