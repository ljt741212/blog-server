import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

    const { icpNumber, icpUrl, websiteName } = dto;

    if (typeof icpNumber !== 'undefined') latest.icpNumber = icpNumber;
    if (typeof icpUrl !== 'undefined') latest.icpUrl = icpUrl;
    if (typeof websiteName !== 'undefined') latest.websiteName = websiteName;

    return this.icpInfoRepository.save(latest);
  }
}
