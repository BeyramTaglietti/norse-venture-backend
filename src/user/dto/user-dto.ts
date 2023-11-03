import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const usernameSchema = z.string().min(4);

const ChangeUsernameSchema = z.object({
  username: usernameSchema,
});

export class ChangeUsernameDto extends createZodDto(ChangeUsernameSchema) {}
