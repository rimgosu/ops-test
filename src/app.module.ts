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
      // aws rds 연결
      type: 'mysql',
      host: 'database-9.cx6dp2mhue1c.ap-northeast-2.rds.amazonaws.com', // docker : 'localhost'
      port: 3306,
      username: 'admin', // docker : 'root'
      password: process.env.AWS_RDS_PSWD, // docker : '1234'
      database: 'opstest', // docker : 'opstest'
      entities: [User], 
      synchronize: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: '1234',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}