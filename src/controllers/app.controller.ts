import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('/health')
  healthCheck(@Res() response: Response) {
    return response.status(200).json({ status: 'OK' });
  }
}
