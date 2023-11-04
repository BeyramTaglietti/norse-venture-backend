import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Task, Trip } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async getTrips(userId: number): Promise<Trip[]> {
    return await this.prisma.trip.findMany({ where: { ownerId: userId } });
  }

  async createTrip(trip: Trip, userId: number): Promise<Trip> {
    trip.ownerId = userId;

    return await this.prisma.trip.create({ data: trip });
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
      throw new HttpException(
        'The current trip does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getTasks(tripId: number, userId: number): Promise<Task[]> {
    const trip = await this.prisma.trip.findUnique({
      select: {
        id: true,
      },
      where: {
        id: tripId,
        ownerId: userId,
      },
    });

    if (!trip)
      throw new HttpException(
        'The current trip does not exist',
        HttpStatus.NOT_FOUND,
      );

    return await this.prisma.task.findMany({
      where: {
        tripId,
      },
    });
  }

  async createTask(task: Task, tripId: number, userId: number): Promise<Task> {
    const trip = await this.prisma.trip.findUnique({
      select: {
        id: true,
      },
      where: {
        ownerId: userId,
        id: tripId,
      },
    });

    if (!trip)
      throw new HttpException('Trip does not exist', HttpStatus.NOT_FOUND);

    task.tripId = trip.id;

    return await this.prisma.task.create({
      data: task,
    });
  }

  async patchTask({
    tripId,
    userId,
    taskId,
    task,
  }: {
    tripId: number;
    userId: number;
    taskId: number;
    task: Task;
  }): Promise<Task> {
    const trip = await this.prisma.trip.findUnique({
      select: { id: true },
      where: {
        id: tripId,
        ownerId: userId,
      },
    });

    if (!trip)
      throw new HttpException('Trip does not exist', HttpStatus.NOT_FOUND);

    try {
      return await this.prisma.task.update({
        data: task,
        where: {
          id: taskId,
        },
      });
    } catch (e) {
      throw new HttpException('Task does not exist', HttpStatus.NOT_FOUND);
    }
  }

  async deleteTask({
    taskId,
    tripId,
    userId,
  }: {
    taskId: number;
    tripId: number;
    userId: number;
  }): Promise<Task> {
    const trip = await this.prisma.trip.findUnique({
      select: { id: true },
      where: {
        id: tripId,
        ownerId: userId,
      },
    });

    if (!trip)
      throw new HttpException('Trip does not exist', HttpStatus.NOT_FOUND);

    try {
      const task = await this.prisma.task.delete({
        where: {
          id: taskId,
        },
      });

      return task;
    } catch {
      throw new HttpException('Task does not exist', HttpStatus.NOT_FOUND);
    }
  }
}
