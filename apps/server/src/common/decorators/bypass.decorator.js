"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BYPASS_KEY = void 0;
exports.Bypass = Bypass;
const common_1 = require("@nestjs/common");
exports.BYPASS_KEY = Symbol('__bypass_key__');
function Bypass() {
    return (0, common_1.SetMetadata)(exports.BYPASS_KEY, true);
}
//# sourceMappingURL=bypass.decorator.js.map