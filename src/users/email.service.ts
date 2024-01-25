// email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'naver',
      auth: {
        user: 'practice93@naver.com',
        pass: '1234',
      },
    });
  }

  async sendVerificationToEmail(email: string, code: string): Promise<void> {
    const emailOptions: EmailOptions = {
      from: 'your_email@naver.com',
      to: email,
      subject: '가입 인증 메일',
      html: `<h1>인증 코드: ${code}</h1>`,
    };

    await this.transporter.sendMail(emailOptions);
  }
}
