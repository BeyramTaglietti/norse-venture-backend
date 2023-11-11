import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';

import { Trip, User } from '@prisma/client';
import { CreateTripDto } from './dto';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private tripService: TripsService) {}

  @Get()
  async getTrips(@GetUser() user: User): Promise<Trip[]> {
    return this.tripService.getTrips(user.id);
  }

  @Get(':tripId')
  getTrip(
    @GetUser() user: User,
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<Trip> {
    return this.tripService.getTrip(user.id, tripId);
  }

  @Get(':tripId/partecipants')
  getTripPartecipants(
    @GetUser() user: User,
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<User[]> {
    return this.tripService.getTripPartecipants(user.id, tripId);
  }

  @Post()
  createTrip(@Body() trip: CreateTripDto, @GetUser() user: User) {
    return this.tripService.createTrip(trip as Trip, user.id);
  }

  @Delete(':tripId')
  deleteTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: User,
  ) {
    return this.tripService.deleteTrip(tripId, user.id);
  }
}
