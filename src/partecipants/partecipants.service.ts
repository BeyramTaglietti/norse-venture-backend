import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User, UserInTrip } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PartecipantsService {
  constructor(private prisma: PrismaService) {}

  async getPartecipants(tripId: number, userId: number): Promise<User[]> {
    console.log('here');
    const trip = await this.prisma.trip
      .findUnique({
        where: {
          id: tripId,
        },
      })
      .partecipants({
        include: {
          user: true,
        },
      });

    if (!trip) throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);

    if (trip.find((x) => x.userId === userId)) {
      return trip.map((x) => x.user);
    } else throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
  }

  async addPartecipant(
    tripId: number,
    userId: number,
    partecipantId: number,
  ): Promise<User> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId, ownerId: userId },
    });

    if (!trip) throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        friends: true,
      },
    });

    if (!user?.friends.find((x) => x.id === partecipantId))
      throw new HttpException(
        'Can only add friends to trip',
        HttpStatus.FORBIDDEN,
      );

    try {
      const addedPartecipant = await this.prisma.userInTrip.create({
        data: {
          userId: partecipantId,
          tripId,
        },
        include: {
          user: true,
        },
      });

      return addedPartecipant.user;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'Partecipant already exists',
            HttpStatus.CONFLICT,
          );
        } else throw new InternalServerErrorException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async removePartecipant(
    tripId: number,
    partecipantId: number,
    user: User,
  ): Promise<UserInTrip> {
    const trip = await this.prisma.trip.findUnique({
      select: {
        id: true,
        ownerId: true,
        partecipants: true,
      },
      where: {
        id: tripId,
      },
    });
    if (!trip) throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);

    const ownerId = trip.ownerId;

    // owner or non-owner is deleting owner
    if (ownerId === partecipantId) {
      if (ownerId === user.id)
        throw new HttpException(
          'Cannot remove owner, delete trip instead',
          HttpStatus.FORBIDDEN,
        );
      else throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
    }

    // non-owner is deleting someone
    if (partecipantId !== user.id && user.id !== ownerId)
      throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);

    // partecipant does not exist
    if (!trip.partecipants.find((x) => x.userId === partecipantId))
      throw new HttpException('Partecipant not found', HttpStatus.NOT_FOUND);

    try {
      return await this.prisma.userInTrip.delete({
        where: {
          tripId_userId: {
            userId: partecipantId,
            tripId: trip.id,
          },
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('failed to remove partecipant');
    }
  }
}
