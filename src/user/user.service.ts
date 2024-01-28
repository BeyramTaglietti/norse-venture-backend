import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtPayload } from 'src/auth/strategies';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsersByUsername(
    username: string,
    user: JwtPayload,
  ): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: username.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });

    return users.filter((x) => x.id !== user.userId);
  }

  async usernameAvailable(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) return false;
    return true;
  }

  async setUsername(
    authenticatedUser: JwtPayload,
    username: string,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: authenticatedUser.userId,
        },
        data: {
          username,
        },
      });

      return user;
    } catch {
      throw new ForbiddenException('username not available');
    }
  }

  async deleteAccount(user: JwtPayload): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: user.userId,
      },
    });
  }
}
