import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { KeywordValidationPipe } from './pipes/unsplash-keyword.pipe';
import { UnsplashService } from './unsplash.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/unsplash')
export class UnsplashController {
  constructor(private unplashService: UnsplashService) {}
  @Get()
  getImages(@Query('keyword', KeywordValidationPipe) keyword: string) {
    return this.unplashService.getImages(keyword);
  }
}
