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

import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtPayload } from 'src/auth/strategies';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get()
  getFriends(@GetUser() user: JwtPayload): Promise<User[]> {
    return this.friendsService.getFriends(user);
  }

  @Delete(':friendId')
  deleteFriend(
    @GetUser() user: JwtPayload,
    @Param('friendId', ParseIntPipe) friendId: number,
  ): Promise<User> {
    return this.friendsService.deleteFriend(user, friendId);
  }
}
