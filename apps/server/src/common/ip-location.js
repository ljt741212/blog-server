"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipToLocation = ipToLocation;
const ip2region_1 = __importDefault(require("ip2region"));
let instance = null;
function getSearcher() {
    if (!instance) {
        instance = new ip2region_1.default();
    }
    return instance;
}
function ipToLocation(ip) {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
        return '本地';
    }
    try {
        const result = getSearcher().search(ip);
        if (!result)
            return null;
        const parts = [result.country, result.province, result.city].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=ip-location.js.map