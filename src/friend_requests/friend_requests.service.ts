import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FriendRequest, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtPayload } from 'src/auth/strategies';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendRequestsService {
  constructor(private prisma: PrismaService) {}

  async getFriendRequest(user: JwtPayload): Promise<{
    sentFriendRequests: User[];
    receivedFriendRequests: User[];
  }> {
    const friendRequests = await this.prisma.user.findUnique({
      where: {
        id: user.userId,
      },
      include: {
        receivedFriendRequests: {
          include: {
            sender: true,
          },
        },
        sentFriendRequests: {
          include: {
            receiver: true,
          },
        },
      },
    });

    if (!friendRequests)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return {
      sentFriendRequests: friendRequests.sentFriendRequests.map(
        (x) => x.receiver,
      ),
      receivedFriendRequests: friendRequests.receivedFriendRequests.map(
        (x) => x.sender,
      ),
    };
  }

  async addFriendRequest(
    user: JwtPayload,
    friendId: number,
  ): Promise<FriendRequest> {
    const friend = await this.prisma.user.findUnique({
      where: { id: friendId },
      include: { friends: true },
    });

    if (friendId === user.userId)
      throw new HttpException(
        'User cannot add himself',
        HttpStatus.BAD_REQUEST,
      );

    if (!friend)
      throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);

    if (friend.friends.find((x) => x.id === user.userId))
      throw new HttpException(
        'User is already a friend',
        HttpStatus.BAD_REQUEST,
      );

    try {
      console.log('receiver', friendId);
      console.log('sender', user.userId);
      return await this.prisma.friendRequest.create({
        data: {
          receiverId: friendId,
          senderId: user.userId,
        },
      });
    } catch (e) {
      console.log(e);
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'Friend request already exists',
            HttpStatus.CONFLICT,
          );
        } else throw new InternalServerErrorException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async acceptFriendRequest(user: JwtPayload, friendId: number): Promise<User> {
    const request = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: friendId, receiverId: user.userId },
      },
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
          .deleteMany({
            where: {
              OR: [
                { senderId: user.userId, receiverId: friendId },
                { senderId: friendId, receiverId: user.userId },
              ],
            },
          })
          .catch(() => null),
      );
      promises.push(
        this.prisma.user.update({
          where: { id: user.userId },
          data: { friends: { connect: [{ id: friendId }] } },
        }),
      );

      let friend: User;

      promises.push(
        this.prisma.user
          .update({
            where: { id: friendId },
            data: { friends: { connect: [{ id: user.userId }] } },
          })
          .then((resp) => (friend = resp)),
      );

      await Promise.all(promises);

      return friend!;
    } catch (e) {
      throw new InternalServerErrorException('Could not accept friend request');
    }
  }

  async denyFriendRequest(
    user: JwtPayload,
    friendId: number,
  ): Promise<FriendRequest> {
    const request = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: friendId, receiverId: user.userId },
      },
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
