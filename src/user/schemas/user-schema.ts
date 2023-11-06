import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(4)
  .regex(/^[a-z0-9]+$/, {
    message: 'No whitespaces, special characters or uppercase letters allowed',
  });

export const ChangeUsernameSchema = z.object({
  username: usernameSchema,
});
