import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtPayload } from 'src/auth/strategies';
import { PrismaService } from 'src/prisma/prisma.service';
import { resizeThumbnail, uploadToS3 } from 'src/shared';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsersByUsername(
    username: string,
    user: JwtPayload,
  ): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: username.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });

    return users.filter((x) => x.id !== user.userId);
  }

  async usernameAvailable(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) return false;
    return true;
  }

  async setUsername(
    authenticatedUser: JwtPayload,
    username: string,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: authenticatedUser.userId,
        },
        data: {
          username,
        },
      });

      return user;
    } catch {
      throw new ForbiddenException('username not available');
    }
  }

  async deleteAccount(user: JwtPayload): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: user.userId,
      },
    });
  }

  async setProfilePicture(
    user: JwtPayload,
    file: Express.Multer.File,
  ): Promise<string> {
    const resizedImage = await resizeThumbnail(file, 500).catch((e) => {
      throw new InternalServerErrorException(e);
    });
    const resizedBuffer = await resizedImage.toBuffer();

    const thumbnailUrl = await uploadToS3({
      folder: 'user_pictures',
      fileName: `user-${user.userId}-picture`,
      resizedImage,
      resizedBuffer,
      isPublic: true,
    }).catch((e) => {
      throw new InternalServerErrorException(e);
    });

    await this.prisma.user.update({
      where: {
        id: user.userId,
      },
      data: {
        profilePicture: thumbnailUrl,
      },
    });

    return thumbnailUrl;
  }
}
