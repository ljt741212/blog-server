"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangelogModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const changelog_controller_1 = require("./changelog.controller");
const changelog_entity_1 = require("./changelog.entity");
const changelog_service_1 = require("./changelog.service");
let ChangelogModule = class ChangelogModule {
};
exports.ChangelogModule = ChangelogModule;
exports.ChangelogModule = ChangelogModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([changelog_entity_1.Changelog])],
        controllers: [changelog_controller_1.ChangelogController],
        providers: [changelog_service_1.ChangelogService],
        exports: [changelog_service_1.ChangelogService],
    })
], ChangelogModule);
//# sourceMappingURL=changelog.module.js.map