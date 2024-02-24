import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from 'src/prisma/prisma.service';
import verifyAppleToken from 'verify-apple-id-token';
import type { JwtPayload } from './strategies/jwt.strategy';
import { Token } from './types';

@Injectable()
export class AuthService {
  private readonly client: OAuth2Client;
  private readonly audiences: string[];

  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {
    this.client = new OAuth2Client({
      clientId: configService.get('WEB_CLIENT_ID'),
    });

    this.audiences = [
      configService.get('IOS_CLIENT_ID')!,
      configService.get('ANDROID_CLIENT_ID')!,
      configService.get('WEB_CLIENT_ID')!,
    ];
  }

  async getRandomUsername(): Promise<string> {
    const username: string = 'User' + Math.floor(Math.random() * 10000000);

    const userExists = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (userExists) this.getRandomUsername();

    return username;
  }

  generateJwtToken(
    payload: JwtPayload,
    expiration: string,
    type: 'access' | 'refresh',
  ) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get(
        type === 'access' ? 'JWT_SECRET' : 'JWT_REFRESH_SECRET',
      ),
      expiresIn: expiration,
    });
  }

  generateTokens(payload: JwtPayload): Token {
    const access_token = this.generateJwtToken(payload, '15m', 'access');
    const refresh_token = this.generateJwtToken(payload, '30d', 'refresh');

    return {
      access_token,
      refresh_token,
    };
  }

  async verifyGoogleToken(token: string): Promise<TokenPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.audiences,
      });

      const payload = ticket.getPayload();

      if (!payload) throw new HttpException(`Token verification failed`, 500);

      return payload;
    } catch (error) {
      // Handle token verification errors (e.g., invalid token, unauthorized client, etc.)
      throw new HttpException(`Token verification failed`, 500);
    }
  }

  async googleLogin(token: string): Promise<
    Token & {
      user: {
        id: number;
        email: string;
        username: string;
        picture: string;
      };
    }
  > {
    const payload = await this.verifyGoogleToken(token);

    return await this.login(payload.email!, payload.picture);
  }

  async appleLogin(token: string): Promise<
    Token & {
      user: {
        id: number;
        email: string;
        username: string;
        picture: string;
      };
    }
  > {
    const payload = await verifyAppleToken({
      idToken: token,
      clientId: this.configService.get('APPLE_CLIENT_ID')!,
    });

    return await this.login(payload.email);
  }

  async login(
    userEmail: string,
    userPicture?: string,
  ): Promise<
    Token & {
      user: { id: number; email: string; username: string; picture: string };
    }
  > {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!userExists) {
      const user = await this.register(userEmail, userPicture);

      const { access_token, refresh_token } = this.generateTokens({
        userId: user.id,
      });

      this.updateRefreshToken(user.id, refresh_token);

      const { id, email, username, picture } = user;

      return {
        access_token,
        refresh_token,
        user: { id, email, username, picture },
      };
    } else {
      const { access_token, refresh_token } = this.generateTokens({
        userId: userExists.id,
      });

      this.updateRefreshToken(userExists.id, refresh_token);

      const { id, email, username, picture } = userExists;

      return {
        access_token,
        refresh_token,
        user: {
          id,
          email,
          username,
          picture,
        },
      };
    }
  }

  async register(email: string, picture?: string): Promise<User> {
    if (!email)
      throw new HttpException(
        'Please provide an email address',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const generatedUsername: string = await this.getRandomUsername();

      const newUser = await this.prismaService.user.create({
        data: {
          email,
          picture: picture ?? '',
          username: generatedUsername,
        },
      });

      return newUser;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) throw new HttpException('User not found', 404);

      if (!user.refreshToken)
        throw new HttpException('Invalid refresh token', 401);

      if (await argon2.verify(user.refreshToken, token)) {
        const { access_token, refresh_token } = this.generateTokens({
          userId: user.id,
        });

        const updatedUser = await this.updateRefreshToken(
          user.id,
          refresh_token,
        );

        return {
          access_token,
          refresh_token,
          user: updatedUser,
        };
      } else throw new HttpException('Invalid refresh token', 401);
    } catch (e) {
      throw new HttpException('Invalid refresh token', 401);
    }
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await argon2.hash(refreshToken);

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedToken,
      },
    });

    return updatedUser;
  }
}
