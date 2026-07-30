import { DataSource } from 'typeorm';
import type { Response } from 'express';
type ImportMode = 'truncate';
type ImportOptions = {
    mode: ImportMode;
};
export declare class DataTransferService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    exportAllToZip(res: Response): Promise<void>;
    importAllFromZip(zipPath: string, options: ImportOptions): Promise<{
        tables: number;
        rows: number;
    }>;
    private validateZipFile;
    private resetAutoIncrements;
}
export {};
