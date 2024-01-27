// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {

    @Get()
    @Public()
    async getAllUsers() {
        return 'hello world';
    }

}
