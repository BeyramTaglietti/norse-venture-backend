import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';
import { ChangeUsernameDto } from './dto/user-dto';
import { z } from 'zod';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('username_available')
  async usernameAvailable(
    @Query('username') username: string,
  ): Promise<boolean> {
    const result = z.string().safeParse(username);

    if (result.success)
      return await this.userService.usernameAvailable(username);
    else throw new ForbiddenException('username not given');
  }

  @Post('set_username')
  @UseGuards(JwtAuthGuard)
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
}
