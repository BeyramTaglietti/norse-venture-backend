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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

  generateJWT(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '10d',
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
      throw new HttpException('User not found', 404);
    }

    const generatedToken = this.generateJWT({
      sub: userExists.id,
      email: userExists.email,
    });

    return {
      access_token: generatedToken,
      user: userExists,
    };
  }

  async register(
    google_token: string,
    username: string,
  ): Promise<Token & { user: User }> {
    const payload = await this.verifyToken(google_token);

    if (!payload.email)
      throw new InternalServerErrorException(
        'Email not provided by google token',
      );

    try {
      const newUser = await this.prismaService.user.create({
        data: {
          email: payload.email,
          picture: payload.picture ?? '',
          username,
        },
      });

      const token = this.generateJWT({
        sub: newUser.id,
        email: newUser.email,
      });

      return {
        access_token: token,
        user: newUser,
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.log(e);
          throw new HttpException(
            'Email or username already exists',
            HttpStatus.CONFLICT,
          );
        }
      }
      throw new InternalServerErrorException();
    }
  }
}
