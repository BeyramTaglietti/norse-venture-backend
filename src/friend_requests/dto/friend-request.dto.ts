import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const addFriendRequestSchema = z.object({
  friendId: z.number(),
});

const patchFriendRequestSchema = z.object({
  friendId: z.number(),
  accept: z.boolean(),
});

export class AddFriendRequestDto extends createZodDto(addFriendRequestSchema) {}

export class PatchFriendRequestDto extends createZodDto(
  patchFriendRequestSchema,
) {}
