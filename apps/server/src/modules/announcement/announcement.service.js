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
exports.AnnouncementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const announcement_entity_1 = require("./announcement.entity");
let AnnouncementService = class AnnouncementService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async paginateForAdmin(query) {
        const qb = this.repo.createQueryBuilder('a');
        if (query.status !== undefined) {
            qb.andWhere('a.status = :status', { status: query.status });
        }
        if (query.searchValue) {
            qb.andWhere('a.title LIKE :kw', { kw: `%${query.searchValue}%` });
        }
        qb.orderBy('a.isTop', 'DESC').addOrderBy('a.createdAt', 'DESC');
        return (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
    }
    async findAll() {
        return this.repo.find({
            where: { status: announcement_entity_1.AnnouncementStatus.PUBLISHED },
            order: { isTop: 'DESC', createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('公告不存在');
        return item;
    }
    async findPublicOne(id) {
        const item = await this.repo.findOne({
            where: { id, status: announcement_entity_1.AnnouncementStatus.PUBLISHED },
        });
        if (!item)
            throw new common_1.NotFoundException('公告不存在');
        return item;
    }
    async create(dto) {
        const entity = this.repo.create(dto);
        return this.repo.save(entity);
    }
    async update(id, dto) {
        const item = await this.findOne(id);
        Object.assign(item, (0, lodash_1.pickBy)(dto, (v) => v !== undefined));
        return this.repo.save(item);
    }
    async save(dto) {
        if (dto.id)
            return this.update(dto.id, dto);
        return this.create(dto);
    }
    async remove(id) {
        const item = await this.findOne(id);
        await this.repo.remove(item);
        return true;
    }
};
exports.AnnouncementService = AnnouncementService;
exports.AnnouncementService = AnnouncementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(announcement_entity_1.Announcement)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnnouncementService);
//# sourceMappingURL=announcement.service.js.map