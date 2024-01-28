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
import { ApiBearerAuth } from '@nestjs/swagger';
import { Task } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { JwtPayload } from 'src/auth/strategies';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TasksService } from './tasks.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get('')
  getTasks(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: JwtPayload,
  ): Promise<Task[]> {
    return this.taskService.getTasks(tripId, user);
  }

  @Post('')
  createTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() task: CreateTaskDto,
    @GetUser() user: JwtPayload,
  ): Promise<Task> {
    return this.taskService.createTask(task as Task, tripId, user);
  }

  @Patch(':taskId')
  patchTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() task: UpdateTaskDto,
    @GetUser() user: JwtPayload,
  ): Promise<Task> {
    return this.taskService.patchTask({
      tripId,
      user: user,
      taskId,
      task: task as Task,
    });
  }

  @Delete(':taskId')
  deleteTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @GetUser() user: JwtPayload,
  ): Promise<Task> {
    return this.taskService.deleteTask({ taskId, tripId, user: user });
  }
}
