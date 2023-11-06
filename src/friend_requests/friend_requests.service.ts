import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FriendRequest, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendRequestsService {
  constructor(private prisma: PrismaService) {}

  async getFriendRequest(user: User): Promise<{
    sentFriendRequests: FriendRequest[];
    receivedFriendRequests: FriendRequest[];
  }> {
    const receivedFriendRequests = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        receivedFriendRequests: true,
        sentFriendRequests: true,
      },
    });

    return receivedFriendRequests;
  }

  async getSentFriendRequest(user: User): Promise<FriendRequest[]> {
    const receivedFriendRequests = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        sentFriendRequests: true,
      },
    });

    return receivedFriendRequests.sentFriendRequests;
  }

  async addFriendRequest(user: User, friendId: number): Promise<FriendRequest> {
    const friend = await this.prisma.user.findUnique({
      where: { id: friendId },
      include: { friends: true },
    });

    if (friendId === user.id)
      throw new HttpException(
        'User cannot add himself',
        HttpStatus.BAD_REQUEST,
      );

    if (!friend)
      throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);

    if (friend.friends.find((x) => x.id === user.id))
      throw new HttpException(
        'User is already a friend',
        HttpStatus.BAD_REQUEST,
      );

    try {
      return await this.prisma.friendRequest.create({
        data: {
          receiverId: friendId,
          senderId: user.id,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'Friend request already exists',
            HttpStatus.CONFLICT,
          );
        }
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async acceptFriendRequest(user: User, friendId: number): Promise<User> {
    const request = await this.prisma.friendRequest.findUnique({
      where: { senderId: friendId, receiverId: user.id },
    });

    if (!request)
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
    try {
      const promises: Promise<any>[] = [];

      promises.push(
        this.prisma.friendRequest.delete({
          where: {
            id: request.id,
          },
        }),
      );

      promises.push(
        this.prisma.friendRequest
          .delete({
            where: {
              senderId: user.id,
              receiverId: friendId,
            },
          })
          .catch(() => null),
      );

      promises.push(
        this.prisma.user.update({
          where: { id: user.id },
          data: { friends: { connect: [{ id: friendId }] } },
        }),
      );

      let friend: User;

      promises.push(
        this.prisma.user
          .update({
            where: { id: friendId },
            data: { friends: { connect: [{ id: user.id }] } },
          })
          .then((resp) => (friend = resp)),
      );

      await Promise.all(promises);

      return friend;
    } catch (e) {
      throw new InternalServerErrorException('Could not accept friend request');
    }
  }

  async denyFriendRequest(
    user: User,
    friendId: number,
  ): Promise<FriendRequest> {
    const request = await this.prisma.friendRequest.findUnique({
      where: { senderId: friendId, receiverId: user.id },
    });

    if (!request)
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);

    try {
      return await this.prisma.friendRequest.delete({
        where: {
          id: request.id,
        },
      });
    } catch {
      throw new InternalServerErrorException('Could not deny friend request');
    }
  }
}
