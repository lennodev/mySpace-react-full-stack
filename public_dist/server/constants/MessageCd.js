"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // 1st digits = msg type (9=error, 1=normal)
    // 2nd digits = module code
    // 3rd digits = action code
    // user or auth shared same module code = 1
    USER_EMAIL_ALREADY_EXIST: 91001,
    USER_LOGIN_INVALID_CREDENTIAL: 91002,
    // space module code = 2
    SPACE_CREATE_SPACE_FAILED_UNKNOWN: 92101,
    SPACE_UPDATE_SPACE_FAILED_UNKNOWN: 92201,
    SPACE_UPDATE_SPACE_FAILED_NOT_FOUND: 92202,
    SPACE_DELETE_SPACE_FAILED_UNKNOWN: 92301,
    SPACE_DELETE_SPACE_FAILED_NOT_FOUND: 92302,
    SPACE_UPDATE_SPACE_REMOVE_IMG_FAILED: 92401,
    SPACE_UPDATE_SPACE_REMOVE_IMG_FAILED_NOT_FOUND: 92402
};
//# sourceMappingURL=MessageCd.js.map