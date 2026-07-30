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
exports.TagService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const tag_entity_1 = require("./tag.entity");
let TagService = class TagService {
    tagRepository;
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
    }
    async paginateForAdmin(query) {
        const qb = this.tagRepository.createQueryBuilder('tag');
        if (query.searchValue) {
            qb.andWhere('(tag.name LIKE :kw OR tag.description LIKE :kw)', {
                kw: `%${query.searchValue}%`,
            });
        }
        if (query.status !== undefined) {
            qb.andWhere('tag.status = :status', { status: query.status });
        }
        qb.orderBy('tag.created_at', 'DESC');
        return (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
    }
    async findAll() {
        return this.tagRepository.find({
            where: { status: tag_entity_1.TagStatus.ENABLED },
            order: { id: 'DESC' },
        });
    }
    async findOne(id) {
        const tag = await this.tagRepository.findOne({ where: { id } });
        if (!tag)
            throw new common_1.NotFoundException('标签不存在');
        return tag;
    }
    async create(dto) {
        const entity = this.tagRepository.create({
            name: dto.name,
            description: dto.description,
            status: dto.status ?? tag_entity_1.TagStatus.ENABLED,
        });
        try {
            return await this.tagRepository.save(entity);
        }
        catch (e) {
            const err = e;
            if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
                throw new common_1.BadRequestException('标签名称已存在');
            }
            throw e;
        }
    }
    async update(id, dto) {
        const tag = await this.findOne(id);
        Object.assign(tag, (0, lodash_1.pickBy)(dto, (v) => v !== undefined));
        try {
            return await this.tagRepository.save(tag);
        }
        catch (e) {
            const err = e;
            if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
                throw new common_1.BadRequestException('标签名称已存在');
            }
            throw e;
        }
    }
    async save(dto) {
        if (dto.id)
            return this.update(dto.id, dto);
        return this.create(dto);
    }
    async remove(id) {
        const tag = await this.findOne(id);
        try {
            await this.tagRepository.remove(tag);
        }
        catch (e) {
            const err = e;
            if (err?.errno === 1451) {
                throw new common_1.BadRequestException('该标签下有文章，无法删除');
            }
            throw e;
        }
        return true;
    }
};
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TagService);
//# sourceMappingURL=tag.service.js.map