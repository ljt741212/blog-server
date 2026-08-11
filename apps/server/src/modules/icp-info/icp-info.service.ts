import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pickBy } from 'lodash';
import { Repository } from 'typeorm';

import { SaveIcpInfoDto } from './icp-info.dto';
import { IcpInfo } from './icp-info.entity';

@Injectable()
export class IcpInfoService {
  constructor(
    @InjectRepository(IcpInfo)
    private readonly icpInfoRepository: Repository<IcpInfo>,
  ) {}

  async getLatest() {
    const [latest] = await this.icpInfoRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    return latest ?? null;
  }

  async save(dto: SaveIcpInfoDto) {
    const latest = await this.getLatest();

    if (!latest) {
      const entity = this.icpInfoRepository.create(dto);
      return this.icpInfoRepository.save(entity);
    }

    Object.assign(
      latest,
      pickBy(dto, (v) => v !== undefined),
    );
    return this.icpInfoRepository.save(latest);
  }
}
