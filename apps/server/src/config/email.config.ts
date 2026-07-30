import { ConfigType, registerAs } from '@nestjs/config';

import { env, envNumber } from '@/global/env';

export const emailRegToken = 'email';

export const EmailConfig = registerAs(emailRegToken, () => ({
  host: env('EMAIL_HOST', 'smtp.qq.com'),
  port: envNumber('EMAIL_PORT', 465),
  secure: env('EMAIL_SECURE', 'true') !== 'false',
  user: env('EMAIL_USER', ''),
  pass: env('EMAIL_PASS', ''),
  from: env('EMAIL_FROM', ''),
}));

export type IEmailConfig = ConfigType<typeof EmailConfig>;
