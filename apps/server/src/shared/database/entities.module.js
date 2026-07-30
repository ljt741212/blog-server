"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const announcement_entity_1 = require("../../../../../src/modules/announcement/announcement.entity");
const category_entity_1 = require("../../../../../src/modules/category/category.entity");
const changelog_entity_1 = require("../../../../../src/modules/changelog/changelog.entity");
const comment_entity_1 = require("../../../../../src/modules/comment/comment.entity");
const friend_link_entity_1 = require("../../../../../src/modules/friend-link/friend-link.entity");
const guest_message_entity_1 = require("../../../../../src/modules/guest-message/guest-message.entity");
const icp_info_entity_1 = require("../../../../../src/modules/icp-info/icp-info.entity");
const post_entity_1 = require("../../../../../src/modules/post/post.entity");
const seo_setting_entity_1 = require("../../../../../src/modules/seo-setting/seo-setting.entity");
const site_config_entity_1 = require("../../../../../src/modules/site-config/site-config.entity");
const tag_entity_1 = require("../../../../../src/modules/tag/tag.entity");
const user_entity_1 = require("../../../../../src/modules/user/user.entity");
const visitor_log_entity_1 = require("../../../../../src/modules/visitor/visitor-log.entity");
const visitor_entity_1 = require("../../../../../src/modules/visitor/visitor.entity");
let EntitiesModule = class EntitiesModule {
};
exports.EntitiesModule = EntitiesModule;
exports.EntitiesModule = EntitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                announcement_entity_1.Announcement,
                category_entity_1.Category,
                changelog_entity_1.Changelog,
                comment_entity_1.Comment,
                friend_link_entity_1.FriendLink,
                guest_message_entity_1.GuestMessage,
                icp_info_entity_1.IcpInfo,
                post_entity_1.Post,
                seo_setting_entity_1.SeoSetting,
                site_config_entity_1.SiteConfig,
                tag_entity_1.Tag,
                user_entity_1.User,
                visitor_entity_1.Visitor,
                visitor_log_entity_1.VisitorLog,
            ]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], EntitiesModule);
//# sourceMappingURL=entities.module.js.map