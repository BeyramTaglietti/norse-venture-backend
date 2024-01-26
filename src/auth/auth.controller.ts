import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { LoginDto, RefreshDto } from './dto';
import { JwtAuthGuard } from './guards';
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

  @Post('google_login')
  login(@Body() loginBody: LoginDto): Promise<Token> {
    return this.authService.login(loginBody.google_token);
  }

  @Post('refresh_token')
  refreshToken(@Body() body: RefreshDto): Promise<Token> {
    return this.authService.refreshToken(body.refresh_token);
  }
}
