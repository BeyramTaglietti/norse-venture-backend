import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const ChangeUsernameSchema = z.object({
  username: z.string().min(4),
});

export class ChangeUsernameDto extends createZodDto(ChangeUsernameSchema) {}

const CreateUserSchema = z.object({
  email: z.string().email(),
  picture: z.string().optional(),
  username: z.string().min(4),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
