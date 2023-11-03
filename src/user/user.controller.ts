import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';
import { ChangeUsernameDto, usernameSchema } from './dto/user-dto';
import { ZodError } from 'zod';
import { ZodValidationException } from 'nestjs-zod';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('username_available')
  async usernameAvailable(
    @Query('username') username: string,
  ): Promise<boolean> {
    try {
      usernameSchema.parse(username);
      return await this.userService.usernameAvailable(username);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ZodValidationException(err);
      }
    }
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
