"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendLinkModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const friend_link_controller_1 = require("./friend-link.controller");
const friend_link_entity_1 = require("./friend-link.entity");
const friend_link_service_1 = require("./friend-link.service");
let FriendLinkModule = class FriendLinkModule {
};
exports.FriendLinkModule = FriendLinkModule;
exports.FriendLinkModule = FriendLinkModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([friend_link_entity_1.FriendLink])],
        controllers: [friend_link_controller_1.FriendLinkController],
        providers: [friend_link_service_1.FriendLinkService],
        exports: [friend_link_service_1.FriendLinkService],
    })
], FriendLinkModule);
//# sourceMappingURL=friend-link.module.js.map