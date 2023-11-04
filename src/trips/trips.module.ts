import { Module } from '@nestjs/common';

import { TripService } from './trips.service';
import { TripController } from './trips.controller';

@Module({
  controllers: [TripController],
  providers: [TripService],
})
export class TripsModule {}
