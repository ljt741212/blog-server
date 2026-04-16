import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';
import { Category } from '@/modules/category/category.entity';
import { Tag } from '@/modules/tag/tag.entity';

import { PostController } from './post.controller';
import { Post } from './post.entity';
import { PostService } from './post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Category, Tag]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [PostController],
  providers: [PostService, JwtAuthGuard],
  exports: [PostService],
})
export class PostModule {}
