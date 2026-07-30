"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentTypeEnum = exports.RESPONSE_SUCCESS_MSG = exports.RESPONSE_SUCCESS_CODE = void 0;
exports.RESPONSE_SUCCESS_CODE = 200;
exports.RESPONSE_SUCCESS_MSG = 'success';
var ContentTypeEnum;
(function (ContentTypeEnum) {
    ContentTypeEnum["JSON"] = "application/json;charset=UTF-8";
    ContentTypeEnum["FORM_URLENCODED"] = "application/x-www-form-urlencoded;charset=UTF-8";
    ContentTypeEnum["FORM_DATA"] = "multipart/form-data;charset=UTF-8";
})(ContentTypeEnum || (exports.ContentTypeEnum = ContentTypeEnum = {}));
//# sourceMappingURL=response.constant.js.map