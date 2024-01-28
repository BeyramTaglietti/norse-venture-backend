import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { JwtPayload } from 'src/auth/strategies';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskType } from './dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getTasks(tripId: number, user: JwtPayload): Promise<Task[]> {
    console.log('user', user.userId);
    console.log('trip', tripId);

    const trip = await this.prisma.trip.findUnique({
      select: {
        tasks: true,
      },
      where: { id: tripId, partecipants: { some: { userId: user.userId } } },
    });

    if (!trip) throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);

    return trip.tasks;
  }

  async createTask(
    task: Task,
    tripId: number,
    user: JwtPayload,
  ): Promise<Task> {
    const trip = await this.prisma.trip.findUnique({
      select: {
        id: true,
      },
      where: {
        id: tripId,
        partecipants: { some: { userId: user.userId } },
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
    user,
    taskId,
    task,
  }: {
    tripId: number;
    user: JwtPayload;
    taskId: number;
    task: UpdateTaskType;
  }): Promise<Task> {
    try {
      return await this.prisma.task.update({
        data: task,
        where: {
          id: taskId,
          trip: {
            id: tripId,
            partecipants: { some: { userId: user.userId } },
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
    user,
  }: {
    taskId: number;
    tripId: number;
    user: JwtPayload;
  }): Promise<Task> {
    try {
      const task = await this.prisma.task.delete({
        where: {
          id: taskId,
          trip: {
            id: tripId,
            partecipants: { some: { userId: user.userId } },
          },
        },
      });

      return task;
    } catch {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }
}
