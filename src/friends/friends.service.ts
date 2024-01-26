import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtPayload } from 'src/auth/strategies';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async getFriends(user: JwtPayload) {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        id: user.userId,
      },
      include: {
        friends: true,
      },
    });

    if (!foundUser)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return foundUser.friends;
  }

  async deleteFriend(user: JwtPayload, friendId: number): Promise<User> {
    const friend = await this.prisma.user
      .findUnique({
        where: { id: user.userId },
      })
      .friends({ where: { id: friendId } });

    if (!friend || friend.length === 0)
      throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);

    try {
      const promises: Promise<any>[] = [];
      let deletedUser: User;

      promises.push(
        this.prisma.user
          .update({
            where: { id: user.userId },
            data: {
              friends: {
                disconnect: { id: friendId },
              },
            },
          })
          .then((res) => (deletedUser = res)),
      );

      promises.push(
        this.prisma.user.update({
          where: { id: friendId },
          data: {
            friends: {
              disconnect: {
                id: user.userId,
              },
            },
          },
        }),
      );

      await Promise.all(promises);

      return deletedUser!;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
