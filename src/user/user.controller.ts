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
  async getUsersByUsername(
    @Query('username', UsernameValidationPipe) username: string,
  ) {
    return await this.userService.getUsersByUsername(username);
  }

  @Patch()
  async setUsername(
    @GetUser() user: User,
    @Body() body: ChangeUsernameDto,
  ): Promise<User> {
    const updatedUser = await this.userService.setUsername(
      user.id,
      body.username,
    );

    return updatedUser;
  }

  @Get('username_available')
  async usernameAvailable(
    @Query('username', UsernameValidationPipe) username: string,
  ): Promise<boolean> {
    return await this.userService.usernameAvailable(username);
  }
}
