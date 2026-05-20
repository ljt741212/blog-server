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
  @UseGuards(JwtAuthGuard)
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
    return this.categoryService.save(dto);
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
