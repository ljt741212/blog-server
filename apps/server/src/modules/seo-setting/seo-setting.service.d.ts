import { Repository } from 'typeorm';
import { CreateSeoSettingDto } from './seo-setting.dto';
import { SeoSetting } from './seo-setting.entity';
export declare class SeoSettingService {
    private readonly seoSettingRepository;
    constructor(seoSettingRepository: Repository<SeoSetting>);
    getSeoSetting(): Promise<SeoSetting>;
    save(dto: CreateSeoSettingDto): Promise<SeoSetting>;
}
