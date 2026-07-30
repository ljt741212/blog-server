export declare class ResOp<T = any> {
    data?: T;
    code: number;
    message: string;
    msg: string;
    constructor(code: number, data: T, message?: string);
    static success<T>(data?: T, message?: string): ResOp<T | undefined>;
    static error(code: number, message: string): ResOp<{}>;
}
export declare class TreeResult<T> {
    id: number;
    parentId: number;
    children?: TreeResult<T>[];
}
