import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ConfigKeyPaths } from "../../../../../src/config";
import { EmailCode } from './email-code.entity';
export declare class EmailService {
    private readonly configService;
    private readonly emailCodeRepository;
    private readonly transporter;
    private readonly cfg;
    constructor(configService: ConfigService<ConfigKeyPaths>, emailCodeRepository: Repository<EmailCode>);
    sendCode(to: string): Promise<void>;
    verifyCode(email: string, code: string): Promise<boolean>;
}
