import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Trip } from '@prisma/client';
import { JwtPayload } from 'src/auth/strategies';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTripType } from './dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async getTrips(user: JwtPayload): Promise<Trip[]> {
    const trips = await this.prisma.userInTrip.findMany({
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

    return trips.map((x) => x.trip);
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

    return data.trip;
  }

  async createTrip(trip: Trip, user: JwtPayload): Promise<Trip> {
    trip.ownerId = user.userId;

    try {
      return await this.prisma.trip.create({
        data: {
          ...trip,
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

    return await this.prisma.trip.update({
      where: {
        id: tripFound.id,
      },
      data: trip,
    });
  }
}
