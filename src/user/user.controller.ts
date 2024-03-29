import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { JwtPayload } from 'src/auth/strategies';
import { ChangeUsernameDto } from './dto/user-dto';
import { UsernameValidationPipe } from './pipes';
import { UserService } from './user.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getCurrentUserInfo(@GetUser() user: JwtPayload) {
    return user;
  }

  @Get()
  getUsersByUsername(
    @Query('username', UsernameValidationPipe) username: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.userService.getUsersByUsername(username, user);
  }

  @Patch()
  setUsername(
    @GetUser() user: JwtPayload,
    @Body() body: ChangeUsernameDto,
  ): Promise<User> {
    return this.userService.setUsername(user, body.username);
  }

  @Patch('set_profile_picture')
  @UseInterceptors(FileInterceptor('picture'))
  setProfilePicture(
    @GetUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.setProfilePicture(user, file);
  }

  @Get('username_available')
  usernameAvailable(
    @Query('username', UsernameValidationPipe) username: string,
  ): Promise<boolean> {
    return this.userService.usernameAvailable(username);
  }

  @Delete('delete_account')
  deleteAccount(@GetUser() user: JwtPayload) {
    return this.userService.deleteAccount(user);
  }
}
