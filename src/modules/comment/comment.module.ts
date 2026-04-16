import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';
import { Post } from '@/modules/post/post.entity';
import { Visitor } from '@/modules/visitor/visitor.entity';

import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, Visitor]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [CommentController],
  providers: [CommentService, JwtAuthGuard],
  exports: [CommentService],
})
export class CommentModule {}
