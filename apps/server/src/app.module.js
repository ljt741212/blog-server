"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const config_2 = __importDefault(require("./config"));
const ai_module_1 = require("./modules/ai/ai.module");
const announcement_module_1 = require("./modules/announcement/announcement.module");
const category_module_1 = require("./modules/category/category.module");
const changelog_module_1 = require("./modules/changelog/changelog.module");
const comment_module_1 = require("./modules/comment/comment.module");
const data_transfer_module_1 = require("./modules/data-transfer/data-transfer.module");
const email_module_1 = require("./modules/email/email.module");
const friend_link_module_1 = require("./modules/friend-link/friend-link.module");
const guest_message_module_1 = require("./modules/guest-message/guest-message.module");
const icp_info_module_1 = require("./modules/icp-info/icp-info.module");
const oss_module_1 = require("./modules/oss/oss.module");
const post_module_1 = require("./modules/post/post.module");
const seo_setting_module_1 = require("./modules/seo-setting/seo-setting.module");
const setting_module_1 = require("./modules/setting/setting.module");
const site_config_module_1 = require("./modules/site-config/site-config.module");
const tag_module_1 = require("./modules/tag/tag.module");
const user_module_1 = require("./modules/user/user.module");
const visitor_module_1 = require("./modules/visitor/visitor.module");
const auth_module_1 = require("./shared/auth/auth.module");
const database_module_1 = require("./shared/database/database.module");
const entities_module_1 = require("./shared/database/entities.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                expandVariables: true,
                envFilePath: [
                    '.env.local',
                    `.env.${process.env.NODE_ENV || 'development'}`,
                    '.env',
                ],
                load: [...Object.values(config_2.default)],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 60,
                },
            ]),
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            entities_module_1.EntitiesModule,
            ai_module_1.AiModule,
            announcement_module_1.AnnouncementModule,
            seo_setting_module_1.SeoSettingModule,
            friend_link_module_1.FriendLinkModule,
            guest_message_module_1.GuestMessageModule,
            icp_info_module_1.IcpInfoModule,
            setting_module_1.SettingModule,
            site_config_module_1.SiteConfigModule,
            tag_module_1.TagModule,
            category_module_1.CategoryModule,
            user_module_1.UserModule,
            post_module_1.PostModule,
            comment_module_1.CommentModule,
            changelog_module_1.ChangelogModule,
            visitor_module_1.VisitorModule,
            oss_module_1.OssModule,
            data_transfer_module_1.DataTransferModule,
            email_module_1.EmailModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map