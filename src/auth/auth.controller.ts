import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { GetUser } from './decorators';
import { User } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto';
import { Token } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBearerAuth()
  @Get('is_authenticated')
  @UseGuards(JwtAuthGuard)
  isAuthenticated(@GetUser() user: User): User {
    return user;
  }

  @Post('login')
  login(@Body() loginBody: LoginDto): Promise<Token> {
    return this.authService.login(loginBody.google_token);
  }
}
