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
exports.TreeResult = exports.ResOp = void 0;
const swagger_1 = require("@nestjs/swagger");
const response_constant_1 = require("../../../../../src/common/constants/response.constant");
class ResOp {
    data;
    code;
    message;
    msg;
    constructor(code, data, message = response_constant_1.RESPONSE_SUCCESS_MSG) {
        this.code = code;
        this.data = data;
        this.message = message;
        this.msg = message;
    }
    static success(data, message) {
        return new ResOp(response_constant_1.RESPONSE_SUCCESS_CODE, data, message);
    }
    static error(code, message) {
        return new ResOp(code, {}, message);
    }
}
exports.ResOp = ResOp;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'object', additionalProperties: true }),
    __metadata("design:type", Object)
], ResOp.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', default: response_constant_1.RESPONSE_SUCCESS_CODE }),
    __metadata("design:type", Number)
], ResOp.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', default: response_constant_1.RESPONSE_SUCCESS_MSG }),
    __metadata("design:type", String)
], ResOp.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', default: response_constant_1.RESPONSE_SUCCESS_MSG }),
    __metadata("design:type", String)
], ResOp.prototype, "msg", void 0);
class TreeResult {
    id;
    parentId;
    children;
}
exports.TreeResult = TreeResult;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TreeResult.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TreeResult.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], TreeResult.prototype, "children", void 0);
//# sourceMappingURL=response.model.js.map