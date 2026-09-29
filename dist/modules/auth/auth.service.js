"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _appexception = require("../../common/errors/app-exception");
const _staffservice = require("../staff/staff.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
const TOKEN_TTL_SECONDS = 60 * 60 * 12; // matches CommonAuthModule's JwtModule signOptions.expiresIn
let AuthService = class AuthService {
    constructor(staff, jwt){
        this.staff = staff;
        this.jwt = jwt;
    }
    async login(input) {
        const account = await this.staff.verifyCredentials(input.email, input.password);
        if (!account) {
            throw new _appexception.AppException('INVALID_CREDENTIALS', 'Email or password is incorrect.', _common.HttpStatus.UNAUTHORIZED);
        }
        const accessToken = await this.jwt.signAsync({
            sub: account.id,
            email: account.email,
            role: account.role
        });
        return {
            accessToken,
            expiresIn: TOKEN_TTL_SECONDS,
            staff: account
        };
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _staffservice.StaffService === "undefined" ? Object : _staffservice.StaffService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map