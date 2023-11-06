import { Injectable } from '@nestjs/common';

import { ZodValidationPipe } from 'nestjs-zod';
import { keywordSchema } from '../schemas';

@Injectable()
export class KeywordValidationPipe extends ZodValidationPipe {
  constructor() {
    super(keywordSchema);
  }
}
