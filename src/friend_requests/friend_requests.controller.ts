import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { FriendRequestsService } from './friend_requests.service';
import { GetUser } from 'src/auth/decorators';
import { FriendRequest, User } from '@prisma/client';
import { AddFriendRequestDto, PatchFriendRequestDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friend_requests')
export class FriendRequestsController {
  constructor(private friendRequstsService: FriendRequestsService) {}

  @Get('received')
  async getReceivedFriendRequest(@GetUser() user: User): Promise<User[]> {
    const requests = await this.friendRequstsService.getFriendRequest(user);

    return requests.receivedFriendRequests;
  }

  @Get('sent')
  async getSentFriendRequest(@GetUser() user: User): Promise<User[]> {
    const requests = await this.friendRequstsService.getFriendRequest(user);

    return requests.sentFriendRequests;
  }

  @Post()
  addFriend(
    @Body() friend: AddFriendRequestDto,
    @GetUser() user: User,
  ): Promise<FriendRequest> {
    return this.friendRequstsService.addFriendRequest(user, friend.friendId);
  }

  @Patch()
  patchFriendRequest(
    @Body() friendRequest: PatchFriendRequestDto,
    @GetUser() user: User,
  ) {
    if (friendRequest.accept)
      return this.friendRequstsService.acceptFriendRequest(
        user,
        friendRequest.friendId,
      );
    else
      return this.friendRequstsService.denyFriendRequest(
        user,
        friendRequest.friendId,
      );
  }
}
