import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';

import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, JwtAuthGuard],
  exports: [CategoryService],
})
export class CategoryModule {}
