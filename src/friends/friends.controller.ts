import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { FriendsService } from './friends.service';

import { User } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get()
  getFriends(@GetUser() user: User): Promise<User[]> {
    return this.friendsService.getFriends(user);
  }

  @Delete(':friendId')
  deleteFriend(
    @GetUser() user: User,
    @Param('friendId', ParseIntPipe) friendId: number,
  ): Promise<User> {
    return this.friendsService.deleteFriend(user, friendId);
  }
}
