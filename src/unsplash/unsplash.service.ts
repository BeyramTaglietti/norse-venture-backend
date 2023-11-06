import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type randomUnsplashImages = {
  urls: { full: string; regular: string; thumb: string };
}[];

type keywordUnsplashImages = {
  results: randomUnsplashImages;
};

@Injectable()
export class UnsplashService {
  constructor(private config: ConfigService) {}
  async getImages(keyword: string) {
    try {
      const { data } = await axios.get(
        `https://api.unsplash.com/${keyword && 'search/'}photos`,
        {
          params: {
            client_id: this.config.get('UNSPLASH_ACCESS_KEY'),
            page: 1,
            per_page: 20,
            query: keyword,
          },
        },
      );

      if (keyword)
        return (data as keywordUnsplashImages).results.map((image) => {
          const { urls } = image;
          return { full: urls.full, regular: urls.regular, thumb: urls.thumb };
        });
      else
        return (data as randomUnsplashImages).map((image) => {
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
