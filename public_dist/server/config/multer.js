"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSizeFilter = exports.fileTypeFilter = exports.storageOptions = void 0;
const _1 = __importDefault(require("."));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
exports.storageOptions = {
    destination: function (req, file, cb) {
        //upload to temp path
        cb(null, _1.default.fileUpload.tempPath);
    },
    filename: function (req, file, cb) {
        //rename as uuid
        cb(null, uuid_1.v4() + path_1.default.extname(file.originalname));
    }
};
function fileTypeFilter(req, file, callback) {
    var ext = path_1.default.extname(file.originalname);
    let isValid = false;
    for (let supportType of _1.default.fileUpload.fileType) {
        if (ext.toLowerCase() == supportType.toLowerCase()) {
            isValid = true;
            break;
        }
    }
    if (!isValid) {
        return callback(new Error('Only images are allowed'));
    }
    else {
        callback(null, true);
    }
}
exports.fileTypeFilter = fileTypeFilter;
exports.fileSizeFilter = { fileSize: _1.default.fileUpload.maxSize };
//# sourceMappingURL=multer.js.map