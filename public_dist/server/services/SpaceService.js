"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const fileUtil = __importStar(require("../util/fileUtil"));
const Grid_1 = __importDefault(require("../models/Grid"));
const Item_1 = __importDefault(require("../models/Item"));
const Space_1 = __importDefault(require("../models/Space"));
const operationResult_1 = __importDefault(require("../util/operationResult"));
const MessageCd_1 = __importDefault(require("../constants/MessageCd"));
let SpaceService = class SpaceService {
    constructor() {
        this.logger = typedi_1.Container.get('logger');
        this.gridRepo = typedi_1.Container.get('sequelize').getRepository(Grid_1.default);
        this.itemRepo = typedi_1.Container.get('sequelize').getRepository(Item_1.default);
        this.spaceRepo = typedi_1.Container.get('sequelize').getRepository(Space_1.default);
    }
    async getSpaceByUserId(userId) {
        try {
            this.logger.debug('getSpaceByUserId');
            const operResult = new operationResult_1.default();
            const spaceRecordList = await this.spaceRepo.findAll({
                where: { userId },
                include: [{
                        model: this.gridRepo,
                        as: 'grids',
                        attributes: ['gridId'],
                        include: [{
                                model: this.itemRepo,
                                as: 'items',
                                attributes: ['itemId', 'tags', 'category']
                            }]
                    }],
                order: [
                    ['spaceId', 'ASC']
                ]
            });
            operResult.setSuccess(spaceRecordList);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to get space list, reason: %o ', e.message);
            throw e;
        }
    }
    async getSpaceById(spaceId) {
        try {
            this.logger.debug('getSpaceById');
            const operResult = new operationResult_1.default();
            const spaceRecord = await this.spaceRepo.findOne({ where: { spaceId } });
            operResult.setSuccess(spaceRecord);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to get space, reason: %o ', e.message);
            throw e;
        }
    }
    async addSpace(spaceTrans) {
        try {
            this.logger.debug('addSpace');
            const operResult = new operationResult_1.default();
            // move file to new path
            if (spaceTrans.imgPath != null) {
                const newFilePath = fileUtil.moveFileToPath(spaceTrans.imgPath, config_1.default.fileUpload.imgSpacePath);
                spaceTrans.imgPath = newFilePath;
            }
            const spaceRecord = await this.spaceRepo.create(spaceTrans);
            if (!spaceRecord) {
                this.logger.error('Fail to create space');
                operResult.setFail(MessageCd_1.default.SPACE_CREATE_SPACE_FAILED_UNKNOWN, 'Fail to create space');
                return operResult;
            }
            operResult.setSuccess(spaceRecord);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to add space, reason: %o ', e.message);
            throw e;
        }
    }
    async updateSpace(spaceTrans) {
        try {
            this.logger.debug('updateSpace');
            const operResult = new operationResult_1.default();
            const filter = {
                where: { spaceId: spaceTrans.spaceId }
            };
            this.logger.debug('update space record, spaceId: %o', spaceTrans.spaceId);
            const spaceRecord = await this.spaceRepo.findOne(filter);
            if (!spaceRecord) {
                this.logger.error('Fail to find space, spaceId %o ', spaceTrans.spaceId);
                operResult.setFail(MessageCd_1.default.SPACE_UPDATE_SPACE_FAILED_NOT_FOUND, 'Fail to find space');
                return operResult;
            }
            // handle image file
            if (spaceTrans.imgPath != null) {
                // if new image file is uploaded
                // move file to new path
                const newFilePath = fileUtil.moveFileToPath(spaceTrans.imgPath, config_1.default.fileUpload.imgSpacePath);
                spaceTrans.imgPath = newFilePath;
            }
            else {
                // no new image uploaded
                // copy image path from existing
                spaceTrans.imgPath = spaceRecord.imgPath;
            }
            const update = {
                name: spaceTrans.name,
                imgPath: spaceTrans.imgPath,
                location: spaceTrans.location
            };
            // update record
            const options = {
                where: { spaceId: spaceTrans.spaceId },
                returning: true,
                plain: true
            };
            const updResult = await this.spaceRepo.update(update, options);
            if (!updResult) {
                this.logger.error('Fail to update space');
                operResult.setFail(MessageCd_1.default.SPACE_UPDATE_SPACE_FAILED_UNKNOWN, 'Fail to update space');
                return operResult;
            }
            // remove images between new and old is different
            if (updResult && spaceTrans.imgPath !== spaceRecord.imgPath) {
                fileUtil.clearUploadFile(spaceRecord.imgPath);
            }
            operResult.setSuccess(updResult[1]);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to update space, spaceId: %o, reason: %o ', spaceTrans.spaceId, e.message);
            throw e;
        }
    }
    async deleteSpace(spaceId) {
        try {
            this.logger.debug('delete space record, spaceId: %o', spaceId);
            const operResult = new operationResult_1.default();
            const spaceRecord = await this.spaceRepo.findOne({ where: { spaceId } });
            if (!spaceRecord) {
                this.logger.error('Fail to find space, spaceId %o ', spaceId);
                operResult.setFail(MessageCd_1.default.SPACE_DELETE_SPACE_FAILED_NOT_FOUND, 'Fail to find space');
                return operResult;
            }
            const options = {
                where: { spaceId },
                limit: 1
            };
            const delOper = await this.spaceRepo.destroy(options);
            if (delOper) {
                if (spaceRecord.imgPath != null) {
                    fileUtil.clearUploadFile(spaceRecord.imgPath);
                }
            }
            else {
                this.logger.error('Fail to delete space, spaceId %o ', spaceId);
                operResult.setFail(MessageCd_1.default.SPACE_DELETE_SPACE_FAILED_UNKNOWN, 'Fail to delete space');
                return operResult;
            }
            operResult.setSuccess(spaceRecord);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to delete space, spaceId: %o, reason: %o ', spaceId, e.message);
            throw e;
        }
    }
    async deleteSpaceImage(spaceId) {
        let result = false;
        try {
            this.logger.debug('deleteSpaceImage, spaceId: %o', spaceId);
            const operResult = new operationResult_1.default();
            const update = { imgPath: null };
            this.logger.debug('delete space image, spaceId %o', spaceId);
            const spaceRecord = await this.spaceRepo.findOne({ where: { spaceId } });
            if (!spaceRecord) {
                this.logger.error('Fail to find space, spaceId %o ', spaceId);
                operResult.setFail(MessageCd_1.default.SPACE_UPDATE_SPACE_REMOVE_IMG_FAILED_NOT_FOUND, 'Fail to find space');
                return operResult;
            }
            // image already null, return directly
            if (spaceRecord.imgPath == null) {
                operResult.setSuccess(true);
                return operResult;
            }
            // update record
            const options = {
                where: { spaceId }
            };
            const updResult = await this.spaceRepo.update(update, options);
            if (!updResult) {
                this.logger.error('Fail to update space image to null');
                operResult.setFail(MessageCd_1.default.SPACE_UPDATE_SPACE_REMOVE_IMG_FAILED, 'Fail to clear space image');
                return operResult;
            }
            // remove old img
            result = fileUtil.clearUploadFile(spaceRecord.imgPath);
            operResult.setSuccess(result);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to delete space image, spaceId: %o, reason: %o ', spaceId, e.message);
            throw e;
        }
    }
};
SpaceService = __decorate([
    typedi_1.Service()
], SpaceService);
exports.default = SpaceService;
//# sourceMappingURL=SpaceService.js.map