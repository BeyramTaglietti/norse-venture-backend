import { z } from 'zod';

const TokenSchema = z.object({
  access_token: z.string().min(1),
});

export type Token = z.infer<typeof TokenSchema>;
