import { Injectable } from '@nestjs/common';

import { ZodValidationPipe } from 'nestjs-zod';
import { usernameSchema } from '../schemas';

@Injectable()
export class UsernameValidationPipe extends ZodValidationPipe {
  constructor() {
    super(usernameSchema);
  }
}
