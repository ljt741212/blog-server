"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserAgent = parseUserAgent;
const bowser_1 = __importDefault(require("bowser"));
function parseUserAgent(raw) {
    if (!raw)
        return '';
    const parsed = bowser_1.default.parse(raw);
    const os = formatOS(parsed);
    const browser = formatBrowser(parsed);
    if (!os && !browser)
        return raw;
    if (!os)
        return browser || raw;
    if (!browser)
        return os;
    return `${os} + ${browser}`;
}
function formatOS(parsed) {
    const name = parsed.os.name;
    const version = parsed.os.version;
    if (!name)
        return '';
    if (name === 'macOS') {
        return version ? `macOS ${version}` : 'macOS';
    }
    if (name === 'Windows') {
        if (!version)
            return 'Windows';
        const map = {
            '10.0': '10',
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7',
        };
        const mapped = map[version];
        return mapped ? `Windows ${mapped}` : `Windows ${version}`;
    }
    return version ? `${name} ${version}` : name;
}
function formatBrowser(parsed) {
    const name = parsed.browser.name;
    const version = parsed.browser.version;
    if (!name)
        return '';
    const major = version ? version.split('.')[0] : '';
    return major ? `${name} ${major}` : name;
}
//# sourceMappingURL=ua-parser.js.map