import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';
import { Category } from '@/modules/category/category.entity';
import { Comment } from '@/modules/comment/comment.entity';
import { Post } from '@/modules/post/post.entity';

import { VisitorLog } from './visitor-log.entity';
import { VisitorController } from './visitor.controller';
import { Visitor } from './visitor.entity';
import { VisitorService } from './visitor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visitor, VisitorLog, Post, Comment, Category]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [VisitorController],
  providers: [VisitorService, JwtAuthGuard],
  exports: [VisitorService],
})
export class VisitorModule {}
