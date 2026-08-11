import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSeoSettingDto } from './seo-setting.dto';
import { SeoSetting } from './seo-setting.entity';

@Injectable()
export class SeoSettingService {
  constructor(
    @InjectRepository(SeoSetting)
    private readonly seoSettingRepository: Repository<SeoSetting>,
  ) {}

  async getSeoSetting() {
    const [latest] = await this.seoSettingRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    return latest ?? null;
  }

  async save(dto: CreateSeoSettingDto) {
    const latest = await this.getSeoSetting();

    if (!latest) {
      const entity = this.seoSettingRepository.create(dto);
      return this.seoSettingRepository.save(entity);
    }

    Object.assign(latest, dto);

    return this.seoSettingRepository.save(latest);
  }
}
