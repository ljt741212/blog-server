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
exports.IcpInfoController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const icp_info_dto_1 = require("./icp-info.dto");
const icp_info_service_1 = require("./icp-info.service");
let IcpInfoController = class IcpInfoController {
    icpInfoService;
    constructor(icpInfoService) {
        this.icpInfoService = icpInfoService;
    }
    getLatest() {
        return this.icpInfoService.getLatest();
    }
    save(dto) {
        return this.icpInfoService.save(dto);
    }
};
exports.IcpInfoController = IcpInfoController;
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IcpInfoController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [icp_info_dto_1.SaveIcpInfoDto]),
    __metadata("design:returntype", void 0)
], IcpInfoController.prototype, "save", null);
exports.IcpInfoController = IcpInfoController = __decorate([
    (0, common_1.Controller)('icp-info'),
    __metadata("design:paramtypes", [icp_info_service_1.IcpInfoService])
], IcpInfoController);
//# sourceMappingURL=icp-info.controller.js.map