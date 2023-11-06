import { Module } from '@nestjs/common';
import { FriendRequestsService } from './friend_requests.service';
import { FriendRequestsController } from './friend_requests.controller';

@Module({
  providers: [FriendRequestsService],
  controllers: [FriendRequestsController],
})
export class FriendRequestsModule {}
