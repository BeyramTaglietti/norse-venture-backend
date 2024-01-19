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
import { Task, User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
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
    @GetUser() user: User,
  ): Promise<Task[]> {
    return this.taskService.getTasks(tripId, user.id);
  }

  @Post('')
  createTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() task: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.taskService.createTask(task as Task, tripId, user.id);
  }

  @Patch(':taskId')
  patchTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() task: UpdateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.taskService.patchTask({
      tripId,
      userId: user.id,
      taskId,
      task: task as Task,
    });
  }

  @Delete(':taskId')
  deleteTask(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.taskService.deleteTask({ taskId, tripId, userId: user.id });
  }
}
