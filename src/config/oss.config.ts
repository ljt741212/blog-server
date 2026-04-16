import { ConfigType, registerAs } from '@nestjs/config';

import { env, envBoolean, envNumber } from '@/global/env';

export const ossRegToken = 'oss';

export const OssConfig = registerAs(ossRegToken, () => ({
  region: env('OSS_REGION', ''),
  accessKeyId: env('OSS_ACCESS_KEY_ID', ''),
  accessKeySecret: env('OSS_ACCESS_KEY_SECRET', ''),
  bucket: env('OSS_BUCKET', ''),
  endpoint: env('OSS_ENDPOINT', ''),
  secure: envBoolean('OSS_SECURE', true),
  publicBaseUrl: env('OSS_PUBLIC_BASE_URL', ''),
  defaultDir: env('OSS_DEFAULT_DIR', 'uploads'),
  signExpires: envNumber('OSS_SIGN_EXPIRES', 600),
  maxFileSizeMB: envNumber('OSS_MAX_FILE_SIZE_MB', 10),
  allowedMimePrefixes: env('OSS_ALLOWED_MIME_PREFIXES', 'image/'),
}));

export type IOssConfig = ConfigType<typeof OssConfig>;
