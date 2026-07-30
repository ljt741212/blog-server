"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSiteConfigFields1760000000000 = void 0;
class AddSiteConfigFields1760000000000 {
    name = 'AddSiteConfigFields1760000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`site_config\` ADD \`site_started_at\` datetime NULL COMMENT '网站开始运行时间'`);
        await queryRunner.query(`ALTER TABLE \`site_config\` ADD \`footer_text\` varchar(500) NULL COMMENT '页脚一句话'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`site_config\` DROP COLUMN \`footer_text\``);
        await queryRunner.query(`ALTER TABLE \`site_config\` DROP COLUMN \`site_started_at\``);
    }
}
exports.AddSiteConfigFields1760000000000 = AddSiteConfigFields1760000000000;
//# sourceMappingURL=1760000000000-add-site-config-fields.js.map