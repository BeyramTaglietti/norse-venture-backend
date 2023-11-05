import { z } from 'zod';

export const usernameSchema = z.string().min(4);

export const ChangeUsernameSchema = z.object({
  username: usernameSchema,
});
