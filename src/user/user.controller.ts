import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';
import { ChangeUsernameDto } from './dto/user-dto';
import { UsernameValidationPipe } from './pipes';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getCurrentUserInfo(@GetUser() user: User) {
    return user;
  }

  @Get()
  getUsersByUsername(
    @Query('username', UsernameValidationPipe) username: string,
    @GetUser() user: User,
  ) {
    return this.userService.getUsersByUsername(username, user.id);
  }

  @Patch()
  setUsername(
    @GetUser() user: User,
    @Body() body: ChangeUsernameDto,
  ): Promise<User> {
    return this.userService.setUsername(user.id, body.username);
  }

  @Get('username_available')
  usernameAvailable(
    @Query('username', UsernameValidationPipe) username: string,
  ): Promise<boolean> {
    return this.userService.usernameAvailable(username);
  }
}
