"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveFileToPath = exports.clearUploadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const typedi_1 = require("typedi");
function clearUploadFile(path) {
    const logger = typedi_1.Container.get('logger');
    try {
        if (path != null) {
            fs_1.default.unlinkSync(path);
            logger.debug('Item image removed, path: %o ' + path);
        }
        return true;
    }
    catch (err) {
        logger.error('Fail to delete item image file, path: %o, reason: %o ', path, err.message);
        return false;
    }
}
exports.clearUploadFile = clearUploadFile;
function moveFileToPath(tempFilePath, targetPath) {
    const logger = typedi_1.Container.get('logger');
    try {
        const newFilePath = targetPath + "/" + path_1.default.basename(tempFilePath);
        fs_1.default.rename(tempFilePath, newFilePath, function (err) {
            if (err)
                throw err;
        });
        logger.debug('Item image moved from %o to %o ', tempFilePath, newFilePath);
        return newFilePath;
    }
    catch (err) {
        logger.error('Fail to move image file, path: %o, reason: %o ', tempFilePath);
        throw err;
    }
}
exports.moveFileToPath = moveFileToPath;
//# sourceMappingURL=fileUtil.js.map