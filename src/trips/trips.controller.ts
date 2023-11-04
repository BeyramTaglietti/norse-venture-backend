import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TripService } from './trips.service';

import { Task, Trip, User } from '@prisma/client';
import { CreateTaskDto, CreateTripDto, UpdateTaskDto } from './dto';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';

@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripController {
  constructor(private tripService: TripService) {}

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

  @Get(':tripId/tasks')
  getTasks(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: User,
  ): Promise<Task[]> {
    return this.tripService.getTasks(tripId, user.id);
  }

  @Post(':tripId/tasks')
  createTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() task: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tripService.createTask(task as Task, tripId, user.id);
  }

  @Patch(':tripId/tasks/:taskId')
  patchTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() task: UpdateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tripService.patchTask({
      tripId,
      userId: user.id,
      taskId,
      task: task as Task,
    });
  }

  @Delete(':tripId/tasks/:taskId')
  deleteTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tripService.deleteTask({ taskId, tripId, userId: user.id });
  }
}
