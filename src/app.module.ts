import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FriendRequestsModule } from './friend_requests/friend_requests.module';
import { FriendsModule } from './friends/friends.module';
import { AppLoggerMiddleware } from './logger.service';
import { PartecipantsModule } from './partecipants/partecipants.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { TasksModule } from './tasks/tasks.module';
import { TripsModule } from './trips/trips.module';
import { UnsplashModule } from './unsplash/unsplash.module';
import { UserModule } from './user/user.module';

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
    UnsplashModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
