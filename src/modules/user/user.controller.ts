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
  ChangePasswordDto,
  CreateUserDto,
  IdParamDto,
  UpdateUserDto,
  UserPageQueryDto,
  UserLoginDto,
} from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body() dto: UserLoginDto) {
    return this.userService.login(dto);
  }

  @Get('me')
  currentUser(@Headers('authorization') authorization?: string) {
    return this.userService.findCurrentUser(authorization);
  }

  @Get('super-admin')
  async getSuperAdmin() {
    return this.userService.findSuperAdmin();
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(authorization, dto);
  }

  @Get('page')
  @UseGuards(JwtAuthGuard)
  paginate(@Query() query: UserPageQueryDto) {
    return this.userService.paginateForAdmin(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param() params: IdParamDto) {
    return this.userService.findDetailForAdmin(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(
    @Body()
    dto:
      | CreateUserDto
      | (UpdateUserDto & { id?: number | string; Id?: string }),
  ) {
    const rawId = 'id' in dto ? dto.id : (dto as { Id?: string }).Id;
    if (rawId != null && rawId !== '') {
      const id = Number(rawId);
      if (Number.isFinite(id) && id > 0) {
        const rest = { ...dto };
        delete (rest as Record<string, unknown>).id;
        delete (rest as Record<string, unknown>).Id;
        return this.userService.update(id, rest as UpdateUserDto);
      }
    }
    return this.userService.create(dto as CreateUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param() params: IdParamDto, @Body() dto: UpdateUserDto) {
    return this.userService.update(params.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.userService.remove(params.id);
  }

  @Post(':id/delete')
  @UseGuards(JwtAuthGuard)
  removeByPost(@Param() params: IdParamDto) {
    return this.userService.remove(params.id);
  }
}
