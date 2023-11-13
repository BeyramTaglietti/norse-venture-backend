import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import type { JwtPayload } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Token } from './types';
import { User } from '@prisma/client';

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

  generateJWT(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '30d',
    });
  }

  async verifyToken(token: string): Promise<TokenPayload> {
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

  async login(token: string): Promise<Token & { user: User }> {
    const payload = await this.verifyToken(token);

    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!userExists) {
      const user = await this.register(payload);

      const generatedToken = this.generateJWT({
        sub: user.id,
        email: user.email,
      });

      return {
        access_token: generatedToken,
        user,
      };
    } else {
      const generatedToken = this.generateJWT({
        sub: userExists.id,
        email: userExists.email,
      });

      return {
        access_token: generatedToken,
        user: userExists,
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
}
