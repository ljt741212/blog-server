"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestMessageModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const visitor_entity_1 = require("../../../../../src/modules/visitor/visitor.entity");
const guest_message_controller_1 = require("./guest-message.controller");
const guest_message_entity_1 = require("./guest-message.entity");
const guest_message_service_1 = require("./guest-message.service");
let GuestMessageModule = class GuestMessageModule {
};
exports.GuestMessageModule = GuestMessageModule;
exports.GuestMessageModule = GuestMessageModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([guest_message_entity_1.GuestMessage, visitor_entity_1.Visitor])],
        controllers: [guest_message_controller_1.GuestMessageController],
        providers: [guest_message_service_1.GuestMessageService],
        exports: [guest_message_service_1.GuestMessageService],
    })
], GuestMessageModule);
//# sourceMappingURL=guest-message.module.js.map