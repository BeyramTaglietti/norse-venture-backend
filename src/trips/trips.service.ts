import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Trip, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async getTrips(userId: number): Promise<Trip[]> {
    const trips = await this.prisma.userInTrip.findMany({
      where: {
        userId,
      },
      include: {
        trip: true,
      },
    });

    return trips.map((x) => x.trip);
  }

  async getTrip(userId: number, tripId: number): Promise<Trip> {
    const data = await this.prisma.userInTrip.findFirst({
      where: {
        tripId,
        userId,
      },
      include: {
        trip: true,
      },
    });

    if (!data) throw new HttpException('Trip not found', 404);

    return data.trip;
  }

  async getTripPartecipants(userId: number, tripId: number): Promise<User[]> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        partecipants: {
          include: { user: true },
          where: {
            userId,
          },
        },
      },
    });

    if (!trip) throw new HttpException('Trip not found', 404);

    return trip.partecipants.map((x) => x.user);
  }

  async createTrip(trip: Trip, userId: number): Promise<Trip> {
    trip.ownerId = userId;

    try {
      return await this.prisma.trip.create({
        data: {
          ...trip,
          partecipants: {
            create: {
              userId: userId,
            },
          },
        },
      });
    } catch {
      throw new InternalServerErrorException('Failed to create trip');
    }
  }

  async deleteTrip(tripId: number, userId: number): Promise<Trip> {
    try {
      const trip = await this.prisma.trip.delete({
        where: {
          id: tripId,
          ownerId: userId,
        },
      });

      return trip;
    } catch {
      throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);
    }
  }
}
