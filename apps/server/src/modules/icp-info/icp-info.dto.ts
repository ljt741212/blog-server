import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveIcpInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icpNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  icpUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  websiteName?: string;
}
