import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  
  @Controller('users')
  export class AuthController {
    constructor(private usersService: UsersService) {}
  
  }
  