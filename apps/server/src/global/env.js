"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = env;
exports.envString = envString;
exports.envNumber = envNumber;
exports.envBoolean = envBoolean;
function formatValue(key, defaultValue, callback) {
    const value = process.env[key];
    if (typeof value === 'undefined')
        return defaultValue;
    if (!callback)
        return value;
    return callback(value);
}
function env(key, defaultValue = '') {
    return formatValue(key, defaultValue);
}
function envString(key, defaultValue = '') {
    return formatValue(key, defaultValue);
}
function envNumber(key, defaultValue = 0) {
    return formatValue(key, defaultValue, (value) => {
        try {
            return Number(value);
        }
        catch {
            throw new Error(`${key} environment variable is not a number`);
        }
    });
}
function envBoolean(key, defaultValue = false) {
    return formatValue(key, defaultValue, (value) => {
        const lowered = value.toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(lowered))
            return true;
        if (['false', '0', 'no', 'off'].includes(lowered))
            return false;
        throw new Error(`${key} environment variable is not a boolean`);
    });
}
//# sourceMappingURL=env.js.map