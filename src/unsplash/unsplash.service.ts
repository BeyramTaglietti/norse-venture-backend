import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type randomUnsplashImages = {
  urls: { full: string; regular: string; thumb: string };
  user: {
    username: string;
    name: string;
    profile_image: {
      small: string;
    };
  };
  links: {
    download_location: string;
  };
}[];

type keywordUnsplashImages = {
  results: randomUnsplashImages;
};

@Injectable()
export class UnsplashService {
  constructor(private config: ConfigService) {}
  async getImages(
    keyword: string,
  ): Promise<randomUnsplashImages | keywordUnsplashImages> {
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
          return {
            urls: {
              full: image.urls.full,
              regular: image.urls.regular,
              thumb: image.urls.thumb,
            },
            user: {
              username: image.user.username,
              name: image.user.name,
              profile_image: {
                small: image.user.profile_image.small,
              },
            },
            links: {
              download_location: image.links.download_location,
            },
          };
        });
      else
        return (data as randomUnsplashImages).map((image) => {
          return {
            urls: {
              full: image.urls.full,
              regular: image.urls.regular,
              thumb: image.urls.thumb,
            },
            user: {
              username: image.user.username,
              name: image.user.name,
              profile_image: {
                small: image.user.profile_image.small,
              },
            },
            links: {
              download_location: image.links.download_location,
            },
          };
        });
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err))
        throw new InternalServerErrorException(err.message);
      else
        throw new InternalServerErrorException(
          'Could not load unsplash images',
        );
    }
  }

  async triggerDownload(url: string) {
    try {
      const { data } = await axios.get(url, {
        params: {
          client_id: this.config.get('UNSPLASH_ACCESS_KEY'),
        },
      });
      return data;
    } catch (err) {
      if (axios.isAxiosError(err))
        throw new InternalServerErrorException(err.message);
      else throw new InternalServerErrorException('Could not trigger download');
    }
  }
}
