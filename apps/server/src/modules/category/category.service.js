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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const category_entity_1 = require("./category.entity");
let CategoryService = class CategoryService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async paginateForAdmin(query) {
        const qb = this.categoryRepository.createQueryBuilder('category');
        if (query.searchValue) {
            qb.andWhere('(category.name LIKE :kw OR category.description LIKE :kw)', {
                kw: `%${query.searchValue}%`,
            });
        }
        if (query.status !== undefined) {
            qb.andWhere('category.status = :status', { status: query.status });
        }
        qb.orderBy('category.created_at', 'DESC');
        return (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
    }
    async findAll() {
        return this.categoryRepository.find({
            where: { status: category_entity_1.CategoryStatus.ENABLED },
            order: { id: 'DESC' },
        });
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('分类不存在');
        return category;
    }
    async create(dto) {
        const entity = this.categoryRepository.create({
            ...dto,
            status: dto.status ?? category_entity_1.CategoryStatus.ENABLED,
        });
        try {
            return await this.categoryRepository.save(entity);
        }
        catch (e) {
            const err = e;
            if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
                throw new common_1.BadRequestException('分类名称已存在');
            }
            throw e;
        }
    }
    async update(id, dto) {
        const category = await this.findOne(id);
        Object.assign(category, (0, lodash_1.pickBy)(dto, (v) => v !== undefined));
        try {
            return await this.categoryRepository.save(category);
        }
        catch (e) {
            const err = e;
            if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
                throw new common_1.BadRequestException('分类名称已存在');
            }
            throw e;
        }
    }
    async updateStatus(id, status) {
        const category = await this.findOne(id);
        category.status = status;
        return this.categoryRepository.save(category);
    }
    async save(dto) {
        if (dto.id)
            return this.update(dto.id, dto);
        return this.create(dto);
    }
    async remove(id) {
        const category = await this.findOne(id);
        try {
            await this.categoryRepository.remove(category);
        }
        catch (e) {
            const err = e;
            if (err?.errno === 1451) {
                throw new common_1.BadRequestException('该分类下有文章，无法删除');
            }
            throw e;
        }
        return true;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
//# sourceMappingURL=category.service.js.map