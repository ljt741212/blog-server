"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcpInfoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const icp_info_controller_1 = require("./icp-info.controller");
const icp_info_entity_1 = require("./icp-info.entity");
const icp_info_service_1 = require("./icp-info.service");
let IcpInfoModule = class IcpInfoModule {
};
exports.IcpInfoModule = IcpInfoModule;
exports.IcpInfoModule = IcpInfoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([icp_info_entity_1.IcpInfo])],
        controllers: [icp_info_controller_1.IcpInfoController],
        providers: [icp_info_service_1.IcpInfoService],
        exports: [icp_info_service_1.IcpInfoService],
    })
], IcpInfoModule);
//# sourceMappingURL=icp-info.module.js.map