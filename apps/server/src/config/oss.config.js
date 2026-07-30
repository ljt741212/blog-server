"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OssConfig = exports.ossRegToken = void 0;
const config_1 = require("@nestjs/config");
const env_1 = require("../../../../src/global/env");
exports.ossRegToken = 'oss';
exports.OssConfig = (0, config_1.registerAs)(exports.ossRegToken, () => ({
    region: (0, env_1.env)('OSS_REGION', ''),
    accessKeyId: (0, env_1.env)('OSS_ACCESS_KEY_ID', ''),
    accessKeySecret: (0, env_1.env)('OSS_ACCESS_KEY_SECRET', ''),
    bucket: (0, env_1.env)('OSS_BUCKET', ''),
    endpoint: (0, env_1.env)('OSS_ENDPOINT', ''),
    secure: (0, env_1.envBoolean)('OSS_SECURE', true),
    publicBaseUrl: (0, env_1.env)('OSS_PUBLIC_BASE_URL', ''),
    defaultDir: (0, env_1.env)('OSS_DEFAULT_DIR', 'uploads'),
    signExpires: (0, env_1.envNumber)('OSS_SIGN_EXPIRES', 600),
    maxFileSizeMB: (0, env_1.envNumber)('OSS_MAX_FILE_SIZE_MB', 10),
    allowedMimePrefixes: (0, env_1.env)('OSS_ALLOWED_MIME_PREFIXES', 'image/'),
}));
//# sourceMappingURL=oss.config.js.map