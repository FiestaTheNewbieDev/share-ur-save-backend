import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Request, Response } from 'express';
import { SessionGuard } from 'src/guards/session.guard';
import { AuthService } from 'src/services/auth.service';

class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'username should be at least 3 characters' })
  @MaxLength(32, { message: 'username should be at most 32 characters' })
  @Matches(/^[a-zA-Z0-9._\-']+$/, {
    message:
      "username can only contain letters (a-z, A-Z), digits (0-9), and special characters (._-')",
  })
  @ApiProperty()
  username: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

class SignInDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: false })
  stayConnected?: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(
    @Body() body: SignUpDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.authService.signUp(
      body.username,
      body.email,
      body.password,
    );

    return response.status(201).json(result);
  }

  @Post('sign-in')
  async signIn(
    @Body() body: SignInDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      console.log(`[AuthController] sign-in request`);

      const result = await this.authService.signIn(body.login, body.password);

      return response.status(200).json(result);
    } catch (error) {
      console.error(`[AuthController] sign-in error: ${error.message}`);
    }
  }

  @Post('sign-out')
  async signOut(
    @Body() body,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.authService.signOut(request.headers.authorization.split(' ')[1]);
    return response.status(200);
  }
}
