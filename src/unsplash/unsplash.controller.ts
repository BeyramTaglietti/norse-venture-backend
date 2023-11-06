import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UnsplashService } from './unsplash.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { KeywordValidationPipe } from './pipes/unsplash-keyword.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('unsplash')
export class UnsplashController {
  constructor(private unplashService: UnsplashService) {}
  @Get()
  getImages(@Query('keyword', KeywordValidationPipe) keyword: string) {
    return this.unplashService.getImages(keyword);
  }
}
