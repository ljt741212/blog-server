import { SaveIcpInfoDto } from './icp-info.dto';
import { IcpInfoService } from './icp-info.service';
export declare class IcpInfoController {
    private readonly icpInfoService;
    constructor(icpInfoService: IcpInfoService);
    getLatest(): Promise<import("./icp-info.entity").IcpInfo>;
    save(dto: SaveIcpInfoDto): Promise<import("./icp-info.entity").IcpInfo>;
}
