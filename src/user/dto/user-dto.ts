import { createZodDto } from 'nestjs-zod';
import { ChangeUsernameSchema } from '../schemas';

export class ChangeUsernameDto extends createZodDto(ChangeUsernameSchema) {}
