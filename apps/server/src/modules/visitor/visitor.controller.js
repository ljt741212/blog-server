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
exports.VisitorController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const visitor_page_query_dto_1 = require("./dto/visitor-page-query.dto");
const online_stream_service_1 = require("./online-stream.service");
const visitor_service_1 = require("./visitor.service");
let VisitorController = class VisitorController {
    visitorService;
    onlineStreamService;
    constructor(visitorService, onlineStreamService) {
        this.visitorService = visitorService;
        this.onlineStreamService = onlineStreamService;
    }
    async recordVisit(body, req) {
        const visitorId = req.headers['x-visitor-id'] ||
            req.headers['visitor-id'] ||
            '';
        const dto = {
            visitorId: visitorId || (body.visitorId ?? ''),
            url: body.url ?? '',
            referrer: body.referrer,
            userAgent: body.userAgent,
        };
        await this.visitorService.recordVisit(dto, req);
        return { success: true };
    }
    async heartbeat(body, req) {
        const visitorId = req.headers['x-visitor-id'] ||
            req.headers['visitor-id'] ||
            '';
        const dto = {
            visitorId: visitorId || (body.visitorId ?? ''),
            url: body.url ?? '',
            referrer: body.referrer,
            userAgent: body.userAgent,
        };
        await this.visitorService.recordHeartbeat(dto, req);
        return { success: true };
    }
    paginate(query) {
        return this.visitorService.paginateForAdmin(query);
    }
    streamOnline(minutesStr) {
        const minutes = minutesStr ? Math.max(1, parseInt(minutesStr, 10) || 5) : 5;
        return this.onlineStreamService.getStream(minutes);
    }
    async getDashboard() {
        return this.visitorService.getDashboardStats();
    }
};
exports.VisitorController = VisitorController;
__decorate([
    (0, common_1.Post)('visit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VisitorController.prototype, "recordVisit", null);
__decorate([
    (0, common_1.Post)('heartbeat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VisitorController.prototype, "heartbeat", null);
__decorate([
    (0, common_1.Get)('page'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [visitor_page_query_dto_1.VisitorPageQueryDto]),
    __metadata("design:returntype", void 0)
], VisitorController.prototype, "paginate", null);
__decorate([
    (0, common_1.Sse)('online/stream'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)('minutes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisitorController.prototype, "streamOnline", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VisitorController.prototype, "getDashboard", null);
exports.VisitorController = VisitorController = __decorate([
    (0, common_1.Controller)('visitor'),
    __metadata("design:paramtypes", [visitor_service_1.VisitorService,
        online_stream_service_1.OnlineStreamService])
], VisitorController);
//# sourceMappingURL=visitor.controller.js.map