import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';

import { ApiBearerAuth } from '@nestjs/swagger';
import { Trip, User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { CreateTripDto } from './dto';

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

  @Put(':tripId')
  editTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: User,
    @Body() trip: CreateTripDto,
  ) {
    return this.tripService.editTrip(trip as Trip, user.id, tripId);
  }
}
