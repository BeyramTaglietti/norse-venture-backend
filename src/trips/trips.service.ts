import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Trip } from '@prisma/client';
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
        trip: {
          include: {
            partecipants: true,
          },
        },
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
        include: {
          partecipants: true,
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

  async editTrip(trip: Trip, userId: number, tripId: number): Promise<Trip> {
    const tripFound = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
        ownerId: userId,
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
