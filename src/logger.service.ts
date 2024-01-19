import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: any, res: any, next: () => void) {
    const startTime = Date.now();

    res.on('finish', () => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.configService.get('NODE_ENV') === 'development' &&
        console.log(
          `[Nest Logger] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
        );
    });

    next();
  }
}
