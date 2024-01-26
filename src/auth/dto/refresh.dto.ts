import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export class RefreshDto extends createZodDto(RefreshSchema) {}
