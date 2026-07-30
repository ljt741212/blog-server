import { BaseEntity } from 'typeorm';
export declare abstract class CommonEntity extends BaseEntity {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}
