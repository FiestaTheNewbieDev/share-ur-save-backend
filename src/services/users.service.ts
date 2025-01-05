import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { User } from 'share-ur-save-common';
import { FirebaseService } from 'src/services/firebase.service';
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
  constructor(
    private prismaService: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

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

  async updateProfilePicture(
    userUuid: string,
    picture: Express.Multer.File,
  ): Promise<{ user: Omit<User, 'password'> }> {
    let user = await this.findByUuid(userUuid);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const pictureUrl = await this.firebaseService.uploadFile(
      `${userUuid}/profile-picture`,
      picture,
    );

    user = await this.prismaService.user.update({
      where: { uuid: userUuid },
      data: { pictureUrl },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }
}
