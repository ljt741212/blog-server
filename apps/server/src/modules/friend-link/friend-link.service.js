"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendLinkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const typeorm_2 = require("typeorm");
const friend_link_entity_1 = require("./friend-link.entity");
let FriendLinkService = class FriendLinkService {
    friendLinkRepository;
    constructor(friendLinkRepository) {
        this.friendLinkRepository = friendLinkRepository;
    }
    async findAll(status, sortOrder = 'DESC') {
        return this.friendLinkRepository.find({
            where: status !== undefined ? { status } : {},
            order: { sort: sortOrder, createdAt: 'ASC' },
        });
    }
    async findOne(id) {
        const link = await this.friendLinkRepository.findOne({ where: { id } });
        if (!link)
            throw new common_1.NotFoundException('友情链接不存在');
        return link;
    }
    async save(dto) {
        if (dto.id)
            return this.update(dto.id, dto);
        return this.create(dto);
    }
    async create(dto) {
        const entity = this.friendLinkRepository.create(dto);
        return this.friendLinkRepository.save(entity);
    }
    async update(id, dto) {
        const link = await this.findOne(id);
        Object.assign(link, (0, lodash_1.pickBy)(dto, (v) => v !== undefined));
        return this.friendLinkRepository.save(link);
    }
    async updateStatus(id, dto) {
        const link = await this.findOne(id);
        link.status = dto.status;
        return this.friendLinkRepository.save(link);
    }
    async apply(dto) {
        const entity = this.friendLinkRepository.create({
            ...dto,
            status: friend_link_entity_1.FriendLinkStatus.DISABLED,
        });
        await this.friendLinkRepository.save(entity);
    }
    async batchSort(dto) {
        await this.friendLinkRepository.manager.transaction(async (txn) => {
            for (const { id, sort } of dto.items) {
                await txn.update(friend_link_entity_1.FriendLink, id, { sort });
            }
        });
    }
    async remove(id) {
        const link = await this.findOne(id);
        await this.friendLinkRepository.remove(link);
        return true;
    }
};
exports.FriendLinkService = FriendLinkService;
exports.FriendLinkService = FriendLinkService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(friend_link_entity_1.FriendLink)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FriendLinkService);
//# sourceMappingURL=friend-link.service.js.map