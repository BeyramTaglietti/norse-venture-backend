import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getTasks(tripId: number, userId: number): Promise<Task[]> {
    const trip = await this.prisma.trip.findUnique({
      select: {
        tasks: true,
      },
      where: { id: tripId, ownerId: userId },
    });

    if (!trip) throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);

    return trip.tasks;
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

    if (!trip) throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);

    task.tripId = tripId;

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
    try {
      return await this.prisma.task.update({
        data: task,
        where: {
          id: taskId,
          trip: {
            id: tripId,
            ownerId: userId,
          },
        },
      });
    } catch (e) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
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
    try {
      const task = await this.prisma.task.delete({
        where: {
          id: taskId,
          trip: {
            id: tripId,
            ownerId: userId,
          },
        },
      });

      return task;
    } catch {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }
}
