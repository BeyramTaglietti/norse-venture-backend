import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const CreateTripSchema = z.object({
  title: z.string().min(3),
  date: z.coerce.date(),
  background: z.string().url().nullable(),
});

export class CreateTripDto extends createZodDto(CreateTripSchema) {}
