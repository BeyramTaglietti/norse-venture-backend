<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# PRISMA MIGRATIONS

## first migration

  prisma migrate dev --name init

## dev env migration

  prisma migrate dev --name added_job_title

## prod env migration

  prisma migrate deploy


# ENV FILE

  DATABASE_URL=""

  WEB_CLIENT_ID = ""
  IOS_CLIENT_ID = ""
  ANDROID_CLIENT_ID = ""

  JWT_SECRET = ""
  JWT_REFRESH_SECRET = ""

  UNSPLASH_ACCESS_KEY=""

  PORT=8099

  BUCKET_NAME=""
  BUCKET_REGION=""
  BUCKET_ACCESS_KEY=""
  BUCKET_SECRET_KEY=""