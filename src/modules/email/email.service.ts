import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { MoreThan, Repository } from 'typeorm';

import { ConfigKeyPaths, emailRegToken, IEmailConfig } from '@/config';

import { EmailCode } from './email-code.entity';

import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly cfg: IEmailConfig;

  constructor(
    private readonly configService: ConfigService<ConfigKeyPaths>,
    @InjectRepository(EmailCode)
    private readonly emailCodeRepository: Repository<EmailCode>,
  ) {
    const cfg = this.configService.get<IEmailConfig>(emailRegToken, {
      infer: true,
    }) as IEmailConfig | undefined;
    if (!cfg || !cfg.user || !cfg.pass) {
      throw new Error('邮件配置不完整，请检查 EMAIL_USER / EMAIL_PASS');
    }
    this.cfg = cfg;

    this.transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  }

  async sendCode(to: string): Promise<void> {
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new BadRequestException('邮箱格式不正确');
    }

    // 60s 内不允许重复发送
    const recent = await this.emailCodeRepository.findOne({
      where: { email: to, createdAt: MoreThan(new Date(Date.now() - 60_000)) },
      order: { createdAt: 'DESC' },
    });
    if (recent) {
      throw new BadRequestException('发送过于频繁，请 60 秒后再试');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    const entity = this.emailCodeRepository.create({ email: to, code });
    await this.emailCodeRepository.save(entity);

    try {
      await this.transporter.sendMail({
        from: this.cfg.from || this.cfg.user,
        to,
        subject: '登录验证码',
        html: `<p>您的验证码是：<strong>${code}</strong></p><p>5 分钟内有效，请勿泄露。</p>`,
      });
    } catch {
      throw new InternalServerErrorException('邮件发送失败，请稍后重试');
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    if (!email || !code) return false;

    const record = await this.emailCodeRepository.findOne({
      where: { email, code, used: 0 },
      order: { createdAt: 'DESC' },
    });

    if (!record) return false;

    // 5 分钟过期
    if (Date.now() - record.createdAt.getTime() > 5 * 60_000) {
      return false;
    }

    record.used = 1;
    await this.emailCodeRepository.save(record);
    return true;
  }
}
