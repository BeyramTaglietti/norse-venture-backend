import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const LoginSchema = z.object({
  google_token: z.string().min(1),
});

export class LoginDto extends createZodDto(LoginSchema) {}
