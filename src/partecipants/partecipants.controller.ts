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
import { ApiBearerAuth } from '@nestjs/swagger';
import { User, UserInTrip } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { JwtPayload } from 'src/auth/strategies';
import { AddPartecipantDto } from './dto';
import { PartecipantsService } from './partecipants.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/partecipants')
export class PartecipantsController {
  constructor(private partecipantsService: PartecipantsService) {}

  @Get()
  getPartecipants(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: JwtPayload,
  ): Promise<User[]> {
    return this.partecipantsService.getPartecipants(tripId, user);
  }

  @Post()
  addPartecipant(
    @Param('tripId', ParseIntPipe) tripId: number,
    @GetUser() user: JwtPayload,
    @Body() partecipant: AddPartecipantDto,
  ): Promise<User> {
    return this.partecipantsService.addPartecipant(
      tripId,
      user,
      partecipant.userId,
    );
  }

  @Delete(':partecipantId')
  removePartecipant(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('partecipantId', ParseIntPipe) partecipantId: number,
    @GetUser() user: JwtPayload,
  ): Promise<UserInTrip> {
    return this.partecipantsService.removePartecipant(
      tripId,
      partecipantId,
      user,
    );
  }
}
