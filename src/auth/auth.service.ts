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

  generateToken(payload: JwtPayload): Token {
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

  async login(token: string): Promise<
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

    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!userExists) {
      const user = await this.register(payload);

      const { access_token, refresh_token } = this.generateToken({
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
      const { access_token, refresh_token } = this.generateToken({
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

  async register(payload: TokenPayload): Promise<User> {
    if (!payload.email)
      throw new HttpException(
        'Please provide an email address',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const generatedUsername: string = await this.getRandomUsername();

      const newUser = await this.prismaService.user.create({
        data: {
          email: payload.email,
          picture: payload.picture ?? '',
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
        this.prismaService.user.update({
          where: {
            id: user.id,
          },
          data: {
            refreshToken: null,
          },
        });
      } else throw new HttpException('Invalid refresh token', 401);

      const { access_token, refresh_token } = this.generateToken({
        userId: user.id,
      });

      const updatedUser = await this.updateRefreshToken(user.id, refresh_token);

      return {
        access_token,
        refresh_token,
        user: updatedUser,
      };
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
