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
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
// import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
// import events from '../subscribers/events';
const fileUtil = __importStar(require("../util/fileUtil"));
// test for postgresql and sequelize
const Grid_1 = __importDefault(require("../models/Grid"));
const Item_1 = __importDefault(require("../models/Item"));
const Space_1 = __importDefault(require("../models/Space"));
let ItemService = class ItemService {
    constructor() {
        this.logger = typedi_1.Container.get('logger');
        this.itemRepo = typedi_1.Container.get('sequelize').getRepository(Item_1.default);
        this.gridRepo = typedi_1.Container.get('sequelize').getRepository(Grid_1.default);
        this.spaceRepo = typedi_1.Container.get('sequelize').getRepository(Space_1.default);
    }
    async getItemByGridId(gridId) {
        try {
            const itemRecordList = await this.itemRepo.findAll({
                where: { gridId },
                include: [{
                        model: this.gridRepo,
                        include: [{ model: this.spaceRepo, attributes: ['name', 'location'] }],
                        as: 'grid',
                        attributes: ['gridId']
                    }],
                order: [
                    ['updatedOn', 'DESC']
                ]
            });
            return itemRecordList;
        }
        catch (e) {
            this.logger.error('Fail to get item list, reason: %o ', e.message);
            throw e;
        }
    }
    async getItemById(itemId) {
        try {
            const itemRecord = await this.itemRepo.findOne({ where: { itemId } });
            return itemRecord;
        }
        catch (e) {
            this.logger.error('Fail to get item, reason: %o ', e.message);
            throw e;
        }
    }
    async addItem(itemTrans) {
        try {
            this.logger.debug('add item record');
            // move file to new path
            if (itemTrans.imgPath != null) {
                const newFilePath = fileUtil.moveFileToPath(itemTrans.imgPath, config_1.default.fileUpload.imgItemPath);
                itemTrans.imgPath = newFilePath;
            }
            // set reminder complete
            if (itemTrans.reminderDtm != null) {
                // assume reminder not yet complete
                itemTrans.reminderComplete = false;
            }
            else {
                itemTrans.reminderComplete = null;
            }
            const itemRecord = await this.itemRepo.create(itemTrans);
            if (!itemRecord) {
                this.logger.error('Fail to create item');
                throw new Error('Item cannot be created');
            }
            // this.eventDispatcher.dispatch(events.user.signUp, { user: itemRecord });
            return itemRecord;
        }
        catch (e) {
            this.logger.error('Fail to add item, reason: %o ', e.message);
            throw e;
        }
    }
    async updateItem(itemTrans) {
        try {
            const filter = {
                where: { itemId: itemTrans.itemId }
            };
            this.logger.debug('update item record, itemId: %o', itemTrans.itemId);
            const itemRecord = await this.itemRepo.findOne(filter);
            if (!itemRecord) {
                this.logger.error('Fail to find item, itemId %o ', itemTrans.itemId);
                throw new Error('Item not found');
            }
            // prepare reminder completed
            if (itemTrans.reminderDtm != null) {
                // assume reminder not yet complete
                itemTrans.reminderComplete = false;
                // check if remind dtm has not change
                if (itemRecord.reminderDtm != null) {
                    const oldRemind = moment_1.default(itemRecord.reminderDtm);
                    const newRemind = moment_1.default(itemTrans.reminderDtm);
                    if (oldRemind.diff(newRemind, 'seconds', true) === 0) {
                        // no change
                        itemTrans.reminderComplete = itemTrans.reminderComplete;
                    }
                }
            }
            else {
                itemTrans.reminderComplete = null;
            }
            // handle image file
            if (itemTrans.imgPath != null) {
                // if new image file is uploaded
                // move file to new path
                const newFilePath = fileUtil.moveFileToPath(itemTrans.imgPath, config_1.default.fileUpload.imgItemPath);
                itemTrans.imgPath = newFilePath;
            }
            else {
                // no new image uploaded
                // copy image path from existing
                itemTrans.imgPath = itemRecord.imgPath;
            }
            const update = {
                name: itemTrans.name,
                colorCode: itemTrans.colorCode,
                imgPath: itemTrans.imgPath,
                tags: itemTrans.tags,
                description: itemTrans.description,
                category: itemTrans.category,
                reminderDtm: itemTrans.reminderDtm,
                reminderComplete: itemTrans.reminderComplete
            };
            // update record
            const options = {
                where: { itemId: itemTrans.itemId },
                returning: true,
                plain: true
            };
            const updResult = await this.itemRepo.update(update, options);
            if (!updResult) {
                this.logger.error('Fail to update item');
                throw new Error('Item cannot be updated');
            }
            // remove images between new and old is different
            if (updResult && itemTrans.imgPath !== itemRecord.imgPath) {
                fileUtil.clearUploadFile(itemRecord.imgPath);
            }
            return updResult[1];
        }
        catch (e) {
            this.logger.error('Fail to update item, itemId: %o, reason: %o ', itemTrans.itemId, e.message);
            throw e;
        }
    }
    async deleteItem(itemId) {
        try {
            this.logger.debug('delete item record, itemId: %o', itemId);
            const itemRecord = await this.itemRepo.findOne({ where: { itemId } });
            if (!itemRecord) {
                this.logger.error('Fail to find item, itemId %o ', itemId);
                throw new Error('Item not found');
            }
            const options = {
                where: { itemId },
                limit: 1
            };
            const delOper = await this.itemRepo.destroy(options);
            if (delOper) {
                if (itemRecord.imgPath != null) {
                    fileUtil.clearUploadFile(itemRecord.imgPath);
                }
            }
            else {
                this.logger.error('Fail to delete item, itemId %o ', itemId);
                throw new Error('Fail to delete item');
            }
            return itemRecord;
        }
        catch (e) {
            this.logger.error('Fail to delete item, itemId: %o, reason: %o ', itemId, e.message);
            throw e;
        }
    }
    async deleteItemImage(itemId) {
        let result = false;
        try {
            const update = { imgPath: null };
            this.logger.debug('delete item image, itemId %o', itemId);
            const itemRecord = await this.itemRepo.findOne({ where: { itemId } });
            if (!itemRecord) {
                this.logger.error('Fail to find item, itemId %o ', itemId);
                throw new Error('Item not found, %o');
            }
            if (itemRecord.imgPath == null) {
                this.logger.error('Fail to find item image, itemId %o ', itemId);
                throw new Error('Item image not found');
            }
            // update record
            const options = {
                where: { itemId }
            };
            const updResult = await this.itemRepo.update(update, options);
            if (!updResult) {
                this.logger.error('Fail to update item image to null');
                throw new Error('Item image cannot be updated to null');
            }
            // remove old img
            result = fileUtil.clearUploadFile(itemRecord.imgPath);
            return result;
        }
        catch (e) {
            this.logger.error('Fail to delete item image, itemId: %o, reason: %o ', itemId, e.message);
            throw e;
        }
    }
    async searchItem(filters) {
        try {
            // prepare where cause for optional criterias
            const andList = [];
            if (filters.category != null) {
                andList.push({ category: filters.category });
            }
            if (filters.colorCode != null) {
                andList.push({ colorCode: filters.colorCode });
            }
            if (filters.tags != null) {
                andList.push({ tags: { [sequelize_1.Op.iLike]: `%${filters.tags}%` } });
            }
            // where in parent parent column (item->grid->space .location)
            if (filters.location != null) {
                andList.push({ '$grid.space.location$': filters.location });
            }
            // prepare keyword in name and description fields
            const whereCause = {
                [sequelize_1.Op.and]: andList,
                [sequelize_1.Op.or]: [
                    {
                        name: {
                            [sequelize_1.Op.iLike]: `%${filters.keyword}%`
                        }
                    }, {
                        description: {
                            [sequelize_1.Op.iLike]: `%${filters.keyword}%`
                        }
                    }
                ]
            };
            const itemRecordList = await this.itemRepo.findAll({
                where: whereCause,
                include: [{
                        model: this.gridRepo,
                        include: [{
                                model: this.spaceRepo,
                                attributes: ['name', 'location']
                            }],
                        as: 'grid',
                        attributes: ['gridId']
                    }],
                order: [
                    ['updatedOn', 'DESC']
                ]
            });
            return itemRecordList;
        }
        catch (e) {
            this.logger.error('Fail to search item, reason: %o ', e.message);
            throw e;
        }
    }
};
ItemService = __decorate([
    typedi_1.Service()
], ItemService);
exports.default = ItemService;
//# sourceMappingURL=ItemService.js.map