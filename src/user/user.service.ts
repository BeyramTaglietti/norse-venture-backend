import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsersByUsername(username: string) {
    return this.prisma.user.findMany({
      where: {
        username: {
          contains: username,
        },
      },
    });
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

  async setUsername(userId: number, username: string): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
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
}
