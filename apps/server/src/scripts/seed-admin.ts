import * as bcrypt from 'bcryptjs';

import dataSource from '@/config/data-source';
import { User, UserRole } from '@/modules/user/user.entity';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_EMAIL = 'admin@localhost.com';
const DEFAULT_PASSWORD = '123456';

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const count = await userRepo.count();

  if (count > 0) {
    console.log('[seed] 已有用户，跳过创建初始管理员');
    await dataSource.destroy();
    return;
  }

  const username = process.env.SEED_ADMIN_USERNAME ?? DEFAULT_USERNAME;
  const email = process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL;
  const rawPassword = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const password = await bcrypt.hash(rawPassword, 12);

  await userRepo.save(
    userRepo.create({
      username,
      email,
      password,
      role: UserRole.SUPER_ADMIN,
    }),
  );

  console.log('[seed] 已创建初始管理员');
  console.log('  用户名:', username);
  console.log('  邮箱:', email);
  console.log(
    '  密码:',
    rawPassword === DEFAULT_PASSWORD
      ? `${rawPassword}（请尽快在后台修改）`
      : '***',
  );
  await dataSource.destroy();
}

seed().catch((e) => {
  console.error('[seed] 执行失败:', e);
  process.exit(1);
});
