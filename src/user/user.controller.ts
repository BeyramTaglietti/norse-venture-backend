import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';
import { ChangeUsernameDto } from './dto/user-dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('username_available')
  async usernameAvailable(@Body() body: ChangeUsernameDto): Promise<boolean> {
    return await this.userService.usernameAvailable(body.username);
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
