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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcpInfo = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
let IcpInfo = class IcpInfo extends common_entity_1.CommonEntity {
    icpNumber;
    icpUrl;
    websiteName;
};
exports.IcpInfo = IcpInfo;
__decorate([
    (0, typeorm_1.Column)({
        name: 'icp_number',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'ICP备案号',
    }),
    __metadata("design:type", String)
], IcpInfo.prototype, "icpNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'icp_url',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'ICP备案URL',
    }),
    __metadata("design:type", String)
], IcpInfo.prototype, "icpUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'website_name',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '网站名称',
    }),
    __metadata("design:type", String)
], IcpInfo.prototype, "websiteName", void 0);
exports.IcpInfo = IcpInfo = __decorate([
    (0, typeorm_1.Entity)('icp_info')
], IcpInfo);
//# sourceMappingURL=icp-info.entity.js.map