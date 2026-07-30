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
exports.ChangelogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const changelog_entity_1 = require("./changelog.entity");
let ChangelogService = class ChangelogService {
    changelogRepository;
    constructor(changelogRepository) {
        this.changelogRepository = changelogRepository;
    }
    async paginateForAdmin(query) {
        const qb = this.changelogRepository.createQueryBuilder('changelog');
        if (query.searchValue) {
            qb.andWhere('(changelog.version LIKE :kw OR changelog.title LIKE :kw OR changelog.content LIKE :kw)', { kw: `%${query.searchValue}%` });
        }
        if (query.type !== undefined) {
            qb.andWhere('changelog.type = :type', { type: query.type });
        }
        if (query.isPublished !== undefined) {
            qb.andWhere('changelog.isPublished = :isPublished', {
                isPublished: query.isPublished,
            });
        }
        qb.orderBy('changelog.releaseDate', 'DESC').addOrderBy('changelog.createdAt', 'DESC');
        return (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
    }
    async findAll() {
        return this.changelogRepository.find({
            where: { isPublished: true },
            order: {
                releaseDate: 'DESC',
                createdAt: 'DESC',
            },
        });
    }
    async findOne(id) {
        const item = await this.changelogRepository.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('更新日志不存在');
        return item;
    }
    async findPublicOne(id) {
        const item = await this.changelogRepository.findOne({
            where: { id, isPublished: true },
        });
        if (!item)
            throw new common_1.NotFoundException('更新日志不存在');
        return item;
    }
    async create(dto) {
        const { version, title, content, type, isPublished, releaseDate } = dto;
        const entity = this.changelogRepository.create({
            version,
            title,
            content,
            type,
            isPublished: typeof isPublished === 'boolean' ? isPublished : false,
            releaseDate: new Date(releaseDate),
        });
        return this.changelogRepository.save(entity);
    }
    async update(id, dto) {
        const changelog = await this.findOne(id);
        const { releaseDate, ...fields } = dto;
        Object.assign(changelog, (0, lodash_1.pickBy)(fields, (v) => v !== undefined));
        if (releaseDate !== undefined)
            changelog.releaseDate = new Date(releaseDate);
        return this.changelogRepository.save(changelog);
    }
    async updateStatus(id, dto) {
        const changelog = await this.findOne(id);
        changelog.isPublished = dto.isPublished;
        return this.changelogRepository.save(changelog);
    }
    async save(dto) {
        if (dto.id) {
            return this.update(dto.id, dto);
        }
        return this.create(dto);
    }
    async remove(id) {
        const changelog = await this.findOne(id);
        return this.changelogRepository.remove(changelog);
    }
};
exports.ChangelogService = ChangelogService;
exports.ChangelogService = ChangelogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(changelog_entity_1.Changelog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChangelogService);
//# sourceMappingURL=changelog.service.js.map