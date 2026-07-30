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
exports.GuestMessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const visitor_entity_1 = require("../../../../../src/modules/visitor/visitor.entity");
const guest_message_entity_1 = require("./guest-message.entity");
let GuestMessageService = class GuestMessageService {
    guestMessageRepository;
    visitorRepository;
    constructor(guestMessageRepository, visitorRepository) {
        this.guestMessageRepository = guestMessageRepository;
        this.visitorRepository = visitorRepository;
    }
    async create(dto) {
        const { content, nickname, email, userId, visitorId, visitorUuid } = dto;
        let resolvedVisitorId = visitorId;
        if (!userId && !resolvedVisitorId && visitorUuid) {
            let visitor = await this.visitorRepository.findOne({
                where: [{ visitorId: visitorUuid }, { fingerprint: visitorUuid }],
            });
            if (!visitor) {
                visitor = this.visitorRepository.create({
                    visitorId: visitorUuid,
                    fingerprint: visitorUuid,
                });
                visitor = await this.visitorRepository.save(visitor);
            }
            resolvedVisitorId = visitor.id;
        }
        if (!userId && !resolvedVisitorId) {
            throw new common_1.BadRequestException('请提供 userId、visitorId 或 visitorUuid');
        }
        const message = this.guestMessageRepository.create({
            content,
            nickname: nickname ?? undefined,
            email: email ?? undefined,
            userId: userId ?? undefined,
            visitorId: resolvedVisitorId ?? undefined,
            status: guest_message_entity_1.GuestMessageStatus.PENDING,
        });
        const saved = await this.guestMessageRepository.save(message);
        return this.guestMessageRepository.findOneOrFail({
            where: { id: saved.id },
            relations: ['user', 'visitor'],
        });
    }
    async updateStatus(id, status) {
        const message = await this.guestMessageRepository.findOne({
            where: { id },
        });
        if (!message)
            throw new common_1.NotFoundException('留言不存在');
        message.status = status;
        await this.guestMessageRepository.save(message);
        return true;
    }
    async paginateForAdmin(query) {
        const qb = this.guestMessageRepository
            .createQueryBuilder('guest_message')
            .leftJoinAndSelect('guest_message.user', 'user')
            .leftJoinAndSelect('guest_message.visitor', 'visitor');
        if (query.status !== undefined) {
            qb.andWhere('guest_message.status = :status', {
                status: query.status,
            });
        }
        if (query.searchValue) {
            qb.andWhere('(guest_message.content LIKE :kw OR guest_message.nickname LIKE :kw OR guest_message.email LIKE :kw)', { kw: `%${query.searchValue}%` });
        }
        qb.orderBy('guest_message.createdAt', 'DESC');
        const page = await (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
        return {
            ...page,
            items: page.items.map((m) => this.buildGuestMessageItem(m)),
        };
    }
    async findList(query) {
        const { approvedOnly = true } = query;
        const qb = this.guestMessageRepository
            .createQueryBuilder('guest_message')
            .leftJoinAndSelect('guest_message.user', 'user')
            .leftJoinAndSelect('guest_message.visitor', 'visitor');
        if (approvedOnly) {
            qb.andWhere('guest_message.status = :status', {
                status: guest_message_entity_1.GuestMessageStatus.APPROVED,
            });
        }
        qb.orderBy('guest_message.createdAt', 'DESC');
        const list = await qb.getMany();
        return list.map((m) => this.buildGuestMessageForPublic(m));
    }
    async remove(id) {
        const message = await this.guestMessageRepository.findOne({
            where: { id },
        });
        if (!message)
            throw new common_1.NotFoundException('留言不存在');
        await this.guestMessageRepository.remove(message);
        return true;
    }
    buildGuestMessageItem(message) {
        return {
            id: message.id,
            content: message.content,
            status: message.status,
            nickname: message.nickname,
            email: message.email,
            user: message.user
                ? { id: message.user.id, username: message.user.username }
                : null,
            visitor: message.visitor
                ? { id: message.visitor.id, ip: message.visitor.ip }
                : null,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };
    }
    buildGuestMessageForPublic(message) {
        return {
            id: message.id,
            content: message.content,
            nickname: message.nickname,
            user: message.user
                ? {
                    id: message.user.id,
                    username: message.user.username,
                    avatar: message.user.avatar,
                }
                : null,
            visitor: message.visitor
                ? { id: message.visitor.id, ip: message.visitor.ip }
                : null,
            createdAt: message.createdAt,
        };
    }
};
exports.GuestMessageService = GuestMessageService;
exports.GuestMessageService = GuestMessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(guest_message_entity_1.GuestMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(visitor_entity_1.Visitor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GuestMessageService);
//# sourceMappingURL=guest-message.service.js.map