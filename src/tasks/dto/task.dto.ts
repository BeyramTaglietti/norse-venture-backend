import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  price: z.number().optional(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  date: z.coerce.date().optional().nullable(),
  value: z.boolean(),
  price: z.number().optional().nullable(),
});

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
export type UpdateTaskType = z.infer<typeof updateTaskSchema>;
