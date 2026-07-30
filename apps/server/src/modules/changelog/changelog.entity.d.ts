import { CommonEntity } from "../../../../../src/common/entity/common.entity";
export declare enum ChangelogType {
    FEATURE = "feature",
    IMPROVEMENT = "improvement",
    BUGFIX = "bugfix",
    SECURITY = "security"
}
export declare class Changelog extends CommonEntity {
    version: string;
    title: string;
    content: string;
    type: ChangelogType;
    isPublished: boolean;
    releaseDate: Date;
}
