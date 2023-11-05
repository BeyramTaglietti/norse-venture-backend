import { Module } from '@nestjs/common';
import { PartecipantsService } from './partecipants.service';
import { PartecipantsController } from './partecipants.controller';

@Module({
  providers: [PartecipantsService],
  controllers: [PartecipantsController],
})
export class PartecipantsModule {}
