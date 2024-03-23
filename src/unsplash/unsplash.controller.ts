import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { TriggerDownloadSchema } from './dto/unsplash.dto';
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

  @Post('trigger_download')
  triggerDownload(@Body() body: TriggerDownloadSchema) {
    return this.unplashService.triggerDownload(body.url);
  }
}
