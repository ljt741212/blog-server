import { ConfigType } from '@nestjs/config';
export declare const emailRegToken = "email";
export declare const EmailConfig: (() => {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
}>;
export type IEmailConfig = ConfigType<typeof EmailConfig>;
