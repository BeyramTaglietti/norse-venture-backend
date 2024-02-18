import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TripsService } from './trips.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Trip } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { JwtPayload } from 'src/auth/strategies';
import { CreateTripDto } from './dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/trips')
export class TripsController {
  constructor(private tripService: TripsService) {}

  @Get()
  async getTrips(@GetUser() user: JwtPayload): Promise<Trip[]> {
    return this.tripService.getTrips(user);
  }

  @Get(':tripId')
  getTrip(
    @GetUser() user: JwtPayload,
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<Trip> {
    return this.tripService.getTrip(user, tripId);
  }

  @Post()
  createTrip(@Body() trip: CreateTripDto, @GetUser() user: JwtPayload) {
    return this.tripService.createTrip(trip as Trip, user);
  }

  @Delete(':tripId')
  deleteTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: JwtPayload,
  ) {
    return this.tripService.deleteTrip(tripId, user);
  }

  @Put(':tripId')
  editTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: JwtPayload,
    @Body() trip: CreateTripDto,
  ) {
    return this.tripService.editTrip(trip, user, tripId);
  }

  @Post(':tripId/thumbnail')
  @UseInterceptors(FileInterceptor('thumbnail'))
  uploadThumbnail(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tripService.uploadThumbnail(tripId, user, file);
  }
}
