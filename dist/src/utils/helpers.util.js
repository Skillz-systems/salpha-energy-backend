"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastNDaysDate = void 0;
exports.hashPassword = hashPassword;
const argon = require("argon2");
async function hashPassword(passwordString) {
    return await argon.hash(passwordString);
}
const getLastNDaysDate = (days) => {
    const now = new Date();
    const nDaysAgo = new Date(now);
    nDaysAgo.setDate(now.getDate() - days);
    return nDaysAgo;
};
exports.getLastNDaysDate = getLastNDaysDate;
//# sourceMappingURL=helpers.util.js.map