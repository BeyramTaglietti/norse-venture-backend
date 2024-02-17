import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export enum ImageProvider {
  UNSPLASH = 'unsplash',
  S3 = 's3',
}

export const CreateTripSchema = z.object({
  title: z.string().min(3),
  date: z.coerce.date(),
  background: z.string().url().nullable(),
  backgroundProvider: z.nativeEnum(ImageProvider).nullable(),
});

export class CreateTripDto extends createZodDto(CreateTripSchema) {}
export type CreateTripType = z.infer<typeof CreateTripSchema>;
