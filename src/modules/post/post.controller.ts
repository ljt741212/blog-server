import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import {
  IdParamDto,
  PostPageQueryDto,
  SavePostDto,
  UpdatePostStatusDto,
  UpdatePostTopDto,
} from './post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('page')
  paginate(@Query() query: PostPageQueryDto) {
    return this.postService.paginateForAdmin(query);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: IdParamDto) {
    return this.postService.findDetail(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(
    @Body() dto: SavePostDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.postService.save(dto, authorization);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param() params: IdParamDto, @Body() dto: UpdatePostStatusDto) {
    return this.postService.updateStatus(params.id, dto.status);
  }

  @Put(':id/views')
  incrementViews(@Param() params: IdParamDto) {
    return this.postService.incrementViews(params.id);
  }

  @Put(':id/likes')
  incrementLikes(@Param() params: IdParamDto) {
    return this.postService.incrementLikes(params.id);
  }

  @Put(':id/top')
  @UseGuards(JwtAuthGuard)
  updateTop(@Param() params: IdParamDto, @Body() dto: UpdatePostTopDto) {
    return this.postService.updateTop(params.id, dto.isTop);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.postService.remove(params.id);
  }
}
