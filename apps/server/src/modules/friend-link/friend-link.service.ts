import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pickBy } from 'lodash';
import { Repository } from 'typeorm';

import {
  ApplyFriendLinkDto,
  BatchSortDto,
  SaveFriendLinkDto,
  UpdateFriendLinkStatusDto,
} from './friend-link.dto';
import { FriendLink, FriendLinkStatus } from './friend-link.entity';

@Injectable()
export class FriendLinkService {
  constructor(
    @InjectRepository(FriendLink)
    private readonly friendLinkRepository: Repository<FriendLink>,
  ) {}

  async findAll(status?: FriendLinkStatus, sortOrder: 'ASC' | 'DESC' = 'DESC') {
    return this.friendLinkRepository.find({
      where: status !== undefined ? { status } : {},
      order: { sort: sortOrder, createdAt: 'ASC' },
    });
  }

  async findOne(id: number) {
    const link = await this.friendLinkRepository.findOne({ where: { id } });
    if (!link) throw new NotFoundException('友情链接不存在');
    return link;
  }

  async save(dto: SaveFriendLinkDto) {
    if (dto.id) return this.update(dto.id, dto);
    return this.create(dto);
  }

  async create(dto: SaveFriendLinkDto) {
    const entity = this.friendLinkRepository.create(dto);
    return this.friendLinkRepository.save(entity);
  }

  async update(id: number, dto: SaveFriendLinkDto) {
    const link = await this.findOne(id);
    Object.assign(
      link,
      pickBy(dto, (v) => v !== undefined),
    );
    return this.friendLinkRepository.save(link);
  }

  async updateStatus(id: number, dto: UpdateFriendLinkStatusDto) {
    const link = await this.findOne(id);
    link.status = dto.status;
    return this.friendLinkRepository.save(link);
  }

  async apply(dto: ApplyFriendLinkDto) {
    const entity = this.friendLinkRepository.create({
      ...dto,
      status: FriendLinkStatus.DISABLED,
    });
    await this.friendLinkRepository.save(entity);
  }

  async batchSort(dto: BatchSortDto) {
    await this.friendLinkRepository.manager.transaction(async (txn) => {
      for (const { id, sort } of dto.items) {
        await txn.update(FriendLink, id, { sort });
      }
    });
  }

  async remove(id: number) {
    const link = await this.findOne(id);
    await this.friendLinkRepository.remove(link);
    return true;
  }
}
