import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}

const updateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  value: z.boolean(),
});

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
