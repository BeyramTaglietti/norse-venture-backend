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

@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private tripService: TripsService) {}

  @Get()
  getTrips(@GetUser() user: User): Promise<Trip[]> {
    return this.tripService.getTrips(user.id);
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
