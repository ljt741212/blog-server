import { Repository } from 'typeorm';
import { SaveIcpInfoDto } from './icp-info.dto';
import { IcpInfo } from './icp-info.entity';
export declare class IcpInfoService {
    private readonly icpInfoRepository;
    constructor(icpInfoRepository: Repository<IcpInfo>);
    getLatest(): Promise<IcpInfo>;
    save(dto: SaveIcpInfoDto): Promise<IcpInfo>;
}
