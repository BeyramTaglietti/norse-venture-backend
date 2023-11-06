import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { TripsModule } from './trips/trips.module';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TasksModule } from './tasks/tasks.module';
import { PartecipantsModule } from './partecipants/partecipants.module';
import { FriendsModule } from './friends/friends.module';
import { FriendRequestsModule } from './friend_requests/friend_requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TripsModule,
    PrismaModule,
    AuthModule,
    UserModule,
    TasksModule,
    PartecipantsModule,
    FriendsModule,
    FriendRequestsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
