import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Trip } from '@prisma/client';
import { JwtPayload } from 'src/auth/strategies';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTripType } from './dto';

import {
  ImageProvider,
  getSignedImageUrl,
  resizeThumbnail,
  uploadToS3,
} from 'src/shared';

@Injectable()
export class TripsService {
  s3Client: S3Client;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const bucketRegion = config.get('BUCKET_REGION');
    const accessKey = config.get('BUCKET_ACCESS_KEY');
    const secretKey = config.get('BUCKET_SECRET_KEY');

    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      region: bucketRegion,
    });
  }

  async getTrips(user: JwtPayload): Promise<Trip[]> {
    const foundTrips = await this.prisma.userInTrip.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        trip: {
          include: {
            partecipants: true,
          },
        },
      },
    });

    const trips = await Promise.all(
      foundTrips.map(async (x) => {
        const trip = x.trip;

        if (trip.backgroundProvider === ImageProvider.S3) {
          trip.background = await this.getTripThumbnail(trip.id);
        }

        return trip;
      }),
    );

    return trips;
  }

  async getTrip(user: JwtPayload, tripId: number): Promise<Trip> {
    const data = await this.prisma.userInTrip.findFirst({
      where: {
        tripId,
        userId: user.userId,
      },
      include: {
        trip: true,
      },
    });

    if (!data) throw new HttpException('Trip not found', 404);

    if (data.trip.backgroundProvider === ImageProvider.S3) {
      data.trip.background = await this.getTripThumbnail(data.trip.id);
    }

    return data.trip;
  }

  async createTrip(trip: Trip, user: JwtPayload): Promise<Trip> {
    trip.ownerId = user.userId;

    try {
      return await this.prisma.trip.create({
        data: {
          ...trip,
          background: trip.background,
          backgroundProvider: trip.backgroundProvider,
          partecipants: {
            create: {
              userId: user.userId,
            },
          },
        },
        include: {
          partecipants: true,
        },
      });
    } catch {
      throw new InternalServerErrorException('Failed to create trip');
    }
  }

  async deleteTrip(tripId: number, user: JwtPayload): Promise<Trip> {
    try {
      const trip = await this.prisma.trip.delete({
        where: {
          id: tripId,
          ownerId: user.userId,
        },
      });

      this.removeTripThumbnail(tripId);

      return trip;
    } catch {
      throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);
    }
  }

  async editTrip(
    trip: CreateTripType,
    user: JwtPayload,
    tripId: number,
  ): Promise<Trip> {
    const tripFound = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
        ownerId: user.userId,
      },
    });

    if (!tripFound) throw new HttpException('Trip not found', 404);

    if (trip.background) {
      if (tripFound.backgroundProvider === ImageProvider.S3) {
        await this.removeTripThumbnail(tripId);
        trip.backgroundProvider = ImageProvider.EXTERNAL_SERVICE;
      }
    }

    return await this.prisma.trip.update({
      where: {
        id: tripFound.id,
      },
      data: trip,
    });
  }

  async uploadThumbnail(
    tripId: number,
    user: JwtPayload,
    file: Express.Multer.File,
  ): Promise<string> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
        ownerId: user.userId,
      },
    });

    if (!trip) throw new HttpException('Trip not found', 404);

    const resizedImage = await resizeThumbnail(file, 500);
    const resizedBuffer = await resizedImage.toBuffer();

    const thumbnailUrl = await uploadToS3({
      folder: 'trip_thumbnails',
      fileName: `trip-${tripId}-thumbnail`,
      resizedBuffer,
      resizedImage,
    }).catch((e) => {
      throw new InternalServerErrorException(e);
    });

    await this.prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        background: thumbnailUrl,
        backgroundProvider: 's3',
      },
    });

    return this.getTripThumbnail(tripId);
  }

  async getTripThumbnail(tripId: number): Promise<string> {
    return await getSignedImageUrl(
      'trip_thumbnails',
      `trip-${tripId}-thumbnail`,
    );
  }

  async removeTripThumbnail(tripId: number): Promise<void> {
    const bucketParams = {
      Bucket: this.config.get('BUCKET_NAME'),
      Key: `trip-${tripId}-thumbnail`,
    };

    const command = new DeleteObjectCommand(bucketParams);

    const s3DeleteResult = await this.s3Client.send(command);

    if (s3DeleteResult.$metadata.httpStatusCode !== 204) {
      throw new InternalServerErrorException('Failed to delete thumbnail');
    }
  }
}
