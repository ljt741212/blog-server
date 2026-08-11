import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '@/modules/category/category.entity';
import { Comment } from '@/modules/comment/comment.entity';
import { Post } from '@/modules/post/post.entity';

import { OnlineStreamService } from './online-stream.service';
import { VisitorLog } from './visitor-log.entity';
import { VisitorController } from './visitor.controller';
import { Visitor } from './visitor.entity';
import { VisitorService } from './visitor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visitor, VisitorLog, Post, Comment, Category]),
  ],
  controllers: [VisitorController],
  providers: [VisitorService, OnlineStreamService],
  exports: [VisitorService],
})
export class VisitorModule {}
