import { Injectable } from '@nestjs/common';
import { Trip } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async getTrips(): Promise<Trip[]> {
    return await this.prisma.trip.findMany();
  }

  async createTrip(trip: Trip): Promise<Trip> {
    return await this.prisma.trip.create({ data: trip });
  }
}
