import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import {
  CategoryPageQueryDto,
  IdParamDto,
  SaveCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
} from './category.dto';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('page')
  paginate(@Query() query: CategoryPageQueryDto) {
    return this.categoryService.paginateForAdmin(query);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: IdParamDto) {
    return this.categoryService.findOne(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveCategoryDto) {
    if (dto.id) return this.categoryService.update(dto.id, dto);
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param() params: IdParamDto, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(params.id, dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param() params: IdParamDto,
    @Body() dto: UpdateCategoryStatusDto,
  ) {
    return this.categoryService.updateStatus(params.id, dto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.categoryService.remove(params.id);
  }
}
