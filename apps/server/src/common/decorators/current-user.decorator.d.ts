export interface CurrentUserPayload {
    id: number;
}
export declare const CurrentUser: (...dataOrPipes: ("id" | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
