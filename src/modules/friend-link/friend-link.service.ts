import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SaveFriendLinkDto } from './friend-link.dto';
import { FriendLink } from './friend-link.entity';

@Injectable()
export class FriendLinkService {
  constructor(
    @InjectRepository(FriendLink)
    private readonly friendLinkRepository: Repository<FriendLink>,
  ) {}

  async findAll() {
    return this.friendLinkRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number) {
    const link = await this.friendLinkRepository.findOne({ where: { id } });
    if (!link) throw new NotFoundException('友情链接不存在');
    return link;
  }

  async create(dto: SaveFriendLinkDto) {
    const { name, url, description } = dto;

    const entity = this.friendLinkRepository.create({
      name,
      url,
      description,
    });
    return this.friendLinkRepository.save(entity);
  }

  async update(id: number, dto: SaveFriendLinkDto) {
    const link = await this.findOne(id);

    const { name, url, description } = dto;

    if (typeof name !== 'undefined') link.name = name;
    if (typeof url !== 'undefined') link.url = url;
    if (typeof description !== 'undefined') link.description = description;

    return this.friendLinkRepository.save(link);
  }

  async replaceAll(list: SaveFriendLinkDto[]) {
    await this.friendLinkRepository.clear();

    if (!list?.length) return [];

    const entities = list.map(({ name, url, description }) =>
      this.friendLinkRepository.create({
        name,
        url,
        description,
      }),
    );

    return this.friendLinkRepository.save(entities);
  }

  async remove(id: number) {
    const link = await this.findOne(id);
    await this.friendLinkRepository.remove(link);
    return true;
  }
}
