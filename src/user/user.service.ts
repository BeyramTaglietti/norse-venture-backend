import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async usernameAvailable(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (user) return false;
    return true;
  }

  async setUsername(userId: number, username: string) {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
      },
    });

    return user;
  }
}
