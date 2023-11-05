import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User, UserInTrip } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { PartecipantsService } from './partecipants.service';
import { AddPartecipantDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/partecipants')
export class PartecipantsController {
  constructor(private partecipantsService: PartecipantsService) {}

  @Get()
  getPartecipants(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: User,
  ): Promise<User[]> {
    return this.partecipantsService.getPartecipants(tripId, user.id);
  }

  @Post()
  addPartecipant(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: User,
    @Body() partecipant: AddPartecipantDto,
  ): Promise<UserInTrip> {
    return this.partecipantsService.addPartecipant(
      tripId,
      user.id,
      partecipant.userId,
    );
  }

  @Delete(':partecipantId')
  removePartecipant(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('partecipantId', ParseIntPipe) partecipantId: number,
    @GetUser() user: User,
  ): Promise<UserInTrip> {
    return this.partecipantsService.removePartecipant(
      tripId,
      partecipantId,
      user,
    );
  }
}
