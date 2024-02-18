import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FriendRequest, User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { JwtPayload } from 'src/auth/strategies';
import { AddFriendRequestDto, PatchFriendRequestDto } from './dto';
import { FriendRequestsService } from './friend_requests.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/friend_requests')
export class FriendRequestsController {
  constructor(private friendRequstsService: FriendRequestsService) {}

  @Get('received')
  async getReceivedFriendRequest(@GetUser() user: JwtPayload): Promise<User[]> {
    const requests = await this.friendRequstsService.getFriendRequest(user);

    return requests.receivedFriendRequests;
  }

  @Get('sent')
  async getSentFriendRequest(@GetUser() user: JwtPayload): Promise<User[]> {
    const requests = await this.friendRequstsService.getFriendRequest(user);

    return requests.sentFriendRequests;
  }

  @Post()
  addFriend(
    @Body() friend: AddFriendRequestDto,
    @GetUser() user: JwtPayload,
  ): Promise<FriendRequest> {
    return this.friendRequstsService.addFriendRequest(user, friend.friendId);
  }

  @Patch()
  patchFriendRequest(
    @Body() friendRequest: PatchFriendRequestDto,
    @GetUser() user: JwtPayload,
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
