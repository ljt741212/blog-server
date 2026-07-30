import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

import { SaveIcpInfoDto } from '@/modules/icp-info/icp-info.dto';
import { CreateSeoSettingDto } from '@/modules/seo-setting/seo-setting.dto';
import { SaveSiteConfigDto } from '@/modules/site-config/site-config.dto';

export class SaveSettingDto {
  @ValidateNested()
  @Type(() => CreateSeoSettingDto)
  seo: CreateSeoSettingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SaveIcpInfoDto)
  icp?: SaveIcpInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SaveSiteConfigDto)
  siteConfig?: SaveSiteConfigDto;
}
