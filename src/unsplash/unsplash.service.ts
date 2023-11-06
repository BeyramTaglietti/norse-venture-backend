import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type unsplashImages = {
  urls: { full: string; regular: string; thumb: string };
}[];

@Injectable()
export class UnsplashService {
  constructor(private config: ConfigService) {}
  async getImages(keyword: string) {
    try {
      const { data } = await axios.get<unsplashImages>(
        'https://api.unsplash.com/search/photos',
        {
          params: {
            client_id: this.config.get('UNSPLASH_ACCESS_KEY'),
            page: 1,
            per_page: 20,
            query: keyword,
          },
        },
      );

      return data.map((image) => {
        const { urls } = image;
        return { full: urls.full, regular: urls.regular, thumb: urls.thumb };
      });
    } catch (err) {
      if (axios.isAxiosError(err))
        throw new InternalServerErrorException(err.message);
      else
        throw new InternalServerErrorException(
          'Could not load unsplash images',
        );
    }
  }
}
