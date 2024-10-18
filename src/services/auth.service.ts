import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/services/prisma.service';
import { RedisService } from 'src/services/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  private async createSession(user: User): Promise<string> {
    const payload = {
      sub: user.uuid,
      username: user.username,
      email: user.email,
    };
    const sessionId = this.jwtService.sign(payload);
    const { password: _password, ...userWithoutPassword } = user;
    await this.redisService.set(sessionId, JSON.stringify(userWithoutPassword));
    return sessionId;
  }

  async signUp(username: string, email: string, password: string) {
    let user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (user) {
      throw new ConflictException('Email already taken');
    }
    user = await this.prismaService.user.findUnique({
      where: { username },
    });
    if (user) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await this.prismaService.user.create({
      data: { username, email, password: hashedPassword },
    });

    const { password: _password, ...userWithoutPassword } = user;

    const token = await this.createSession(user);
    return { token, user: userWithoutPassword };
  }

  async signIn(login: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: { OR: [{ username: login }, { email: login }] },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _password, ...userWithoutPassword } = user;

    const token = await this.createSession(user);
    return { token, user: userWithoutPassword };
  }

  async signOut(token: string) {
    await this.redisService.del(token);
  }
}
