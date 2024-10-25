import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/services/prisma.service';

type CreateUserParams = {
  username: string;
  email: string;
} & (
  | {
      password: string;
      hashedPassword?: never;
    }
  | {
      password?: never;
      hashedPassword: string;
    }
);

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findByUuid(uuid: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { uuid },
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { username },
    });
  }

  async findByEmailOrUsername(keyword: string): Promise<User> {
    return this.prismaService.user.findFirst({
      where: { OR: [{ username: keyword }, { email: keyword }] },
    });
  }

  async create(params: CreateUserParams): Promise<User> {
    return this.prismaService.user.create({
      data: {
        username: params.username,
        email: params.email,
        password: params.password
          ? await bcrypt.hash(params.password, 10)
          : params.hashedPassword,
      },
    });
  }
}
