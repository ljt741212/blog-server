import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import {
  CommentAdminPageQueryDto,
  CommentIdParamDto,
  CommentsByPostQueryDto,
  CreateCommentDto,
  UpdateCommentStatusDto,
} from './comment.dto';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param() params: CommentIdParamDto,
    @Body() dto: UpdateCommentStatusDto,
  ) {
    return this.commentService.updateStatus(params.id, dto.status);
  }

  @Get('page')
  @UseGuards(JwtAuthGuard)
  paginate(@Query() query: CommentAdminPageQueryDto) {
    return this.commentService.paginateForAdmin(query);
  }

  @Get('by-post')
  findByPostId(@Query() query: CommentsByPostQueryDto) {
    return this.commentService.findByPostId(query);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: CommentIdParamDto) {
    return this.commentService.remove(params.id);
  }
}
