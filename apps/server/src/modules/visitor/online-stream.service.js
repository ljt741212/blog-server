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
exports.OnlineStreamService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const visitor_service_1 = require("./visitor.service");
let OnlineStreamService = class OnlineStreamService {
    visitorService;
    activity$ = new rxjs_1.Subject();
    constructor(visitorService) {
        this.visitorService = visitorService;
    }
    trigger() {
        this.activity$.next();
    }
    getStream(minutes = 5) {
        const fetchStats = () => (0, rxjs_1.from)(this.visitorService.getOnlineStats(minutes)).pipe((0, operators_1.map)((data) => ({ data })));
        return (0, rxjs_1.concat)((0, rxjs_1.defer)(() => fetchStats()), this.activity$.pipe((0, operators_1.switchMap)(() => fetchStats())));
    }
};
exports.OnlineStreamService = OnlineStreamService;
exports.OnlineStreamService = OnlineStreamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => visitor_service_1.VisitorService))),
    __metadata("design:paramtypes", [visitor_service_1.VisitorService])
], OnlineStreamService);
//# sourceMappingURL=online-stream.service.js.map