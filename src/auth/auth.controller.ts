import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { LoginDto, RefreshDto } from './dto';
import { JwtAuthGuard } from './guards';
import { JwtPayload } from './strategies';
import { Token } from './types';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBearerAuth()
  @Get('is_authenticated')
  @UseGuards(JwtAuthGuard)
  isAuthenticated(@GetUser() user: JwtPayload): boolean {
    return !!user;
  }

  @Post('google_login')
  async login(@Body() loginBody: LoginDto): Promise<Token> {
    return this.authService.login(loginBody.google_token);
  }

  @Post('refresh_token')
  refreshToken(@Body() body: RefreshDto): Promise<Token> {
    return this.authService.refreshToken(body.refresh_token);
  }
}
