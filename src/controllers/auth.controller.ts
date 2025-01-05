import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { User } from 'share-ur-save-common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from 'src/services/auth.service';
import { UsersService } from 'src/services/users.service';

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
  private logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('sign-up')
  async signUp(
    @Body() body: SignUpDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.logger.log('Sign-up');

    const result = await this.authService.signUp(
      body.username,
      body.email,
      body.password,
    );

    return response
      .status(201)
      .cookie('session_id', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .json({ user: result.user });
  }

  @Post('sign-in')
  async signIn(
    @Body() body: SignInDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.logger.log('Sign-in');

    const result = await this.authService.signIn(body.login, body.password);

    return response
      .status(200)
      .cookie('session_id', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .json({ user: result.user });
  }

  @Post('sign-out')
  async signOut(
    @Body() body,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.logger.log('Sign-out');

    await this.authService.signOut(request.cookies.session_id);

    return response.status(200).send({
      message: 'Sign-out successful',
    });
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async fetchUser(@Req() request: Request, @Res() response: Response) {
    this.logger.log('Fetch user');

    return response.status(200).json({ user: request.user });
  }

  @Post('user/profile-picture')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @Req() request: Request,
    @UploadedFile() profilePicture: Express.Multer.File,
    @Res() response: Response,
  ) {
    const user: User = request.user as User;

    this.logger.log(`Update profile picture for ${user.email}`);

    const result = await this.usersService.updateProfilePicture(
      user.uuid,
      profilePicture,
    );

    return response.status(200).json({ user: result });
  }
}
