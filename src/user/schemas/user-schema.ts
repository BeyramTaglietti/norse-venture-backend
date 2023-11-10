import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(4)
  .max(20)
  .regex(/^[a-zA-Z0-9_]*$/, {
    message: 'No whitespaces, special characters or uppercase letters allowed',
  });

export const ChangeUsernameSchema = z.object({
  username: usernameSchema,
});
