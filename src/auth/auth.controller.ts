import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOauthGuard, JwtAuthGuard } from './guards';
import { GetUser } from './decorators';
import { User } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBearerAuth()
  @Get('is_authenticated')
  @UseGuards(JwtAuthGuard)
  isAuthenticated(@GetUser() user: User): User {
    return user;
  }

  @Get('login')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  googleAuthRedirect(@Req() req): Promise<{
    access_token: string;
    logged: boolean;
  }> {
    const access_token = this.authService.signIn(req.user);
    return access_token;
  }
}
