"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailConfig = exports.emailRegToken = void 0;
const config_1 = require("@nestjs/config");
const env_1 = require("../../../../src/global/env");
exports.emailRegToken = 'email';
exports.EmailConfig = (0, config_1.registerAs)(exports.emailRegToken, () => ({
    host: (0, env_1.env)('EMAIL_HOST', 'smtp.qq.com'),
    port: (0, env_1.envNumber)('EMAIL_PORT', 465),
    secure: (0, env_1.env)('EMAIL_SECURE', 'true') !== 'false',
    user: (0, env_1.env)('EMAIL_USER', ''),
    pass: (0, env_1.env)('EMAIL_PASS', ''),
    from: (0, env_1.env)('EMAIL_FROM', ''),
}));
//# sourceMappingURL=email.config.js.map