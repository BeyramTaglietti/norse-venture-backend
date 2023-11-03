import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOauthGuard, JwtAuthGuard } from './guards';
import { GetUser } from './decorators';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async googleAuthRedirect(@Req() req): Promise<{
    access_token: string;
    first_login: boolean;
  }> {
    const access_token = await this.authService.signIn(req.user);
    return access_token;
  }
}
