import { Body, Controller, Get, Post } from '@nestjs/common';
import { TripService } from './trip.service';

import { Trip } from '@prisma/client';
import { TripDto } from './dto';

@Controller('trip')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get()
  getTrips() {
    return this.tripService.getTrips();
  }

  @Post()
  createTrip(@Body() trip: TripDto) {
    return this.tripService.createTrip(trip as Trip);
  }
}
