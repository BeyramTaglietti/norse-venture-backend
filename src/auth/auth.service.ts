import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import type { JwtPayload } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  generateJWT(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '10d',
    });
  }

  async signIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!userExists) {
      return this.registerUser(user);
    }

    const token = this.generateJWT({
      sub: userExists.id,
      email: userExists.email,
    });

    return {
      access_token: token,
      first_login: !userExists.username,
    };
  }

  async registerUser(user: { email: string; picture?: string }) {
    try {
      const newUser = await this.prismaService.user.create({
        data: {
          email: user.email,
          picture: user.picture,
        },
      });

      const token = this.generateJWT({
        sub: newUser.id,
        email: newUser.email,
      });

      return {
        access_token: token,
        first_login: true,
      };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
