// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity'; // User 엔티티 임포트
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'opstest',
      entities: [User], // User 엔티티 등록
      synchronize: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: '1234',
      signOptions: { expiresIn: '600s' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}