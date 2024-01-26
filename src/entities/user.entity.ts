import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// UserRole enum 정의
export enum UserRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER
  })
  role: UserRole;

  // 가입시 말도 안되게 어려운 코드로 설정하여 허위 인증 방지
  @Column({ default: Math.random().toString(36) })
  verificationCode: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  refreshToken: string;
}
