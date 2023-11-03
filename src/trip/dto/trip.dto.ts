import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const TripSchema = z.object({
  title: z.string().min(3),
});

export class TripDto extends createZodDto(TripSchema) {}
