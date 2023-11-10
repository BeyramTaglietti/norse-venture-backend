import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { usernameSchema } from 'src/user/schemas';

const RegisterSchema = z.object({
  google_token: z.string().min(1),
  username: usernameSchema,
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
