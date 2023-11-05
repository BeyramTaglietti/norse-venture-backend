import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const addPartecipantsSchema = z.object({
  userId: z.number(),
});

export class AddPartecipantDto extends createZodDto(addPartecipantsSchema) {}
