"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1748851200000 = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
class InitSchema1748851200000 {
    name = 'InitSchema1748851200000';
    async up(queryRunner) {
        const sql = node_fs_1.default.readFileSync(node_path_1.default.join(__dirname, '../../database/schema.sql'), 'utf8');
        await queryRunner.query(sql);
    }
    async down(queryRunner) {
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');
        await queryRunner.query('DROP TABLE IF EXISTS `email_codes`;');
        await queryRunner.query('DROP TABLE IF EXISTS `site_config`;');
        await queryRunner.query('DROP TABLE IF EXISTS `icp_info`;');
        await queryRunner.query('DROP TABLE IF EXISTS `seo_settings`;');
        await queryRunner.query('DROP TABLE IF EXISTS `friend_links`;');
        await queryRunner.query('DROP TABLE IF EXISTS `changelogs`;');
        await queryRunner.query('DROP TABLE IF EXISTS `announcements`;');
        await queryRunner.query('DROP TABLE IF EXISTS `guest_messages`;');
        await queryRunner.query('DROP TABLE IF EXISTS `comments`;');
        await queryRunner.query('DROP TABLE IF EXISTS `posts_tags`;');
        await queryRunner.query('DROP TABLE IF EXISTS `posts`;');
        await queryRunner.query('DROP TABLE IF EXISTS `tags`;');
        await queryRunner.query('DROP TABLE IF EXISTS `categories`;');
        await queryRunner.query('DROP TABLE IF EXISTS `visitor_logs`;');
        await queryRunner.query('DROP TABLE IF EXISTS `visitors`;');
        await queryRunner.query('DROP TABLE IF EXISTS `users`;');
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
}
exports.InitSchema1748851200000 = InitSchema1748851200000;
//# sourceMappingURL=1748851200000-init-schema.js.map