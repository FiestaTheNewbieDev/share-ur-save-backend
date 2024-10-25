import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { RedisService } from 'src/services/redis.service';
import { UsersService } from 'src/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    await this.redisService.set(sessionId, JSON.stringify(userWithoutPassword));
    return sessionId;
  }

  async signUp(
    username: string,
    email: string,
    password: string,
  ): Promise<{ token: string; user: Omit<User, 'password'> }> {
    let user = await this.usersService.findByEmail(email);
    if (user) {
      throw new ConflictException('Email already taken');
    }
    user = await this.usersService.findByUsername(username);
    if (user) {
      throw new ConflictException('Username already taken');
    }

    user = await this.usersService.create({
      username,
      email,
      password,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    const token = await this.createSession(user);
    return { token, user: userWithoutPassword };
  }

  async signIn(
    login: string,
    password: string,
  ): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const user = await this.usersService.findByEmailOrUsername(login);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    const token = await this.createSession(user);
    return { token, user: userWithoutPassword };
  }

  async signOut(token: string): Promise<void> {
    await this.redisService.del(token);
  }

  async fetchUser(token: string): Promise<{ user: Omit<User, 'password'> }> {
    const session = await this.redisService.get(token);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    const payload = this.jwtService.decode(token);
    const user = await this.usersService.findByUuid(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }
}
