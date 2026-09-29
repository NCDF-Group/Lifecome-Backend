"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get hashPassword () {
        return hashPassword;
    },
    get verifyPassword () {
        return verifyPassword;
    }
});
const _nodecrypto = require("node:crypto");
const _nodeutil = require("node:util");
const scrypt = (0, _nodeutil.promisify)(_nodecrypto.scrypt);
const KEY_LENGTH = 64;
async function hashPassword(password) {
    const salt = (0, _nodecrypto.randomBytes)(16).toString('hex');
    const derived = await scrypt(password, salt, KEY_LENGTH);
    return `${salt}:${derived.toString('hex')}`;
}
async function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const derived = await scrypt(password, salt, KEY_LENGTH);
    const hashBuffer = Buffer.from(hash, 'hex');
    if (hashBuffer.length !== derived.length) return false;
    return (0, _nodecrypto.timingSafeEqual)(hashBuffer, derived);
}

//# sourceMappingURL=password.js.map