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
exports.IcpInfoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const typeorm_2 = require("typeorm");
const icp_info_entity_1 = require("./icp-info.entity");
let IcpInfoService = class IcpInfoService {
    icpInfoRepository;
    constructor(icpInfoRepository) {
        this.icpInfoRepository = icpInfoRepository;
    }
    async getLatest() {
        const [latest] = await this.icpInfoRepository.find({
            order: { createdAt: 'DESC' },
            take: 1,
        });
        return latest ?? null;
    }
    async save(dto) {
        const latest = await this.getLatest();
        if (!latest) {
            const entity = this.icpInfoRepository.create(dto);
            return this.icpInfoRepository.save(entity);
        }
        Object.assign(latest, (0, lodash_1.pickBy)(dto, (v) => v !== undefined));
        return this.icpInfoRepository.save(latest);
    }
};
exports.IcpInfoService = IcpInfoService;
exports.IcpInfoService = IcpInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(icp_info_entity_1.IcpInfo)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IcpInfoService);
//# sourceMappingURL=icp-info.service.js.map