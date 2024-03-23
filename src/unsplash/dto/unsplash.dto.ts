import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const triggerDownloadSchema = z.object({
  url: z.string(),
});

export class TriggerDownloadSchema extends createZodDto(
  triggerDownloadSchema,
) {}
