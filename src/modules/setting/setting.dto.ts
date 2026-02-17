import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { SaveFriendLinkDto } from '@/modules/friend-link/friend-link.dto';
import { SaveIcpInfoDto } from '@/modules/icp-info/icp-info.dto';
import { CreateSeoSettingDto } from '@/modules/seo-setting/seo-setting.dto';

export class SaveSettingDto {
  @ValidateNested()
  @Type(() => CreateSeoSettingDto)
  seo: CreateSeoSettingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveFriendLinkDto)
  links?: SaveFriendLinkDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SaveIcpInfoDto)
  icp?: SaveIcpInfoDto;
}
