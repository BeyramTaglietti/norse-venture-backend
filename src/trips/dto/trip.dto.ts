import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateTripSchema = z.object({
  title: z.string().min(3),
  date: z.coerce.date(),
});

export class CreateTripDto extends createZodDto(CreateTripSchema) {}
