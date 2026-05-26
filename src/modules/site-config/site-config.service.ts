import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SaveSiteConfigDto } from './site-config.dto';
import { SiteConfig } from './site-config.entity';

@Injectable()
export class SiteConfigService {
  constructor(
    @InjectRepository(SiteConfig)
    private readonly repo: Repository<SiteConfig>,
  ) {}

  async get() {
    const config = await this.repo.findOne({ where: { id: 1 } });
    return config ?? null;
  }

  async save(dto: SaveSiteConfigDto) {
    let config = await this.repo.findOne({ where: { id: 1 } });

    if (!config) {
      config = this.repo.create({ id: 1 });
    }

    Object.assign(config, dto);
    return this.repo.save(config);
  }
}
