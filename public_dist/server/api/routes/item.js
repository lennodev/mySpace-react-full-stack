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
const express_1 = require("express");
const typedi_1 = require("typedi");
const celebrate_1 = require("celebrate");
const multer_1 = __importDefault(require("multer"));
const ItemService_1 = __importDefault(require("../../services/ItemService"));
const multerOptions = __importStar(require("../../config/multer"));
const config_1 = __importDefault(require("../../config"));
const route = express_1.Router();
exports.default = (app) => {
    // initial setup
    // prepare file upload
    const multerUpload = multer_1.default({
        storage: multer_1.default.diskStorage(multerOptions.storageOptions),
        limits: multerOptions.fileSizeFilter,
        fileFilter: multerOptions.fileTypeFilter
    });
    const logger = typedi_1.Container.get('logger');
    const itemService = typedi_1.Container.get(ItemService_1.default);
    function convertSearchPara(input) {
        if (input === 'NULL')
            return null;
        return input;
    }
    function formatSuccess(payload, message = null) {
        return { isSuccess: true, payload, message };
    }
    function formatItem(itemRecord) {
        const outputItem = {};
        const excludeAttr = ['creationDate',
            'updatedOn',
            'grid' // special handle for grid
        ];
        if (itemRecord == null) {
            const empty = {};
            return empty;
        }
        try {
            // remove image path for display
            if (itemRecord.imgPath != null) {
                itemRecord.imgPath = itemRecord.imgPath.replace(config_1.default.publicFolder, '');
            }
            // copy value from db object to transmission object
            // eslint-disable-next-line dot-notation
            for (const [key, value] of Object.entries(itemRecord['dataValues'])) {
                if (excludeAttr.indexOf(key) < 0) {
                    // non exclude field
                    outputItem[key] = value;
                }
            }
            // special handle for grid
            let spaceName = null;
            let spaceLocation = null;
            if (itemRecord.grid != null && itemRecord.grid.space != null) {
                if (itemRecord.grid.space.name != null) {
                    spaceName = itemRecord.grid.space.name;
                }
                if (itemRecord.grid.space.location != null) {
                    spaceLocation = itemRecord.grid.space.location;
                }
            }
            outputItem.spaceName = spaceName;
            outputItem.spaceLocation = spaceLocation;
            return outputItem;
        }
        catch (e) {
            logger.error('Fail to prepare output item , reason: %o ', e.message);
            throw e;
        }
    }
    function formatItemList(itemRecordList) {
        if (itemRecordList == null) {
            const empty = {};
            return empty;
        }
        try {
            const outputItemList = [];
            if (itemRecordList != null) {
                for (const item of itemRecordList) {
                    outputItemList.push(formatItem(item));
                }
            }
            return outputItemList;
        }
        catch (e) {
            logger.error('Fail to prepare output item list , reason: %o ', e.message);
            throw e;
        }
    }
    app.use('/item', route);
    route.get('/:itemId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            itemId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling getItemById endpoint');
        try {
            const itemId = parseInt(req.params.itemId, 10);
            const itemRecord = await itemService.getItemById(itemId);
            const result = formatItem(itemRecord);
            return res.status(200).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/grid/:gridId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            gridId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling getItemByGridId endpoint');
        try {
            const gridId = parseInt(req.params.gridId, 10);
            const itemRecordList = await itemService.getItemByGridId(gridId);
            const result = formatItemList(itemRecordList);
            return res.status(200).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/search/:keyword/:category?/:colorCode?/:location?/:tags?', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            keyword: celebrate_1.Joi.string().required(),
            category: celebrate_1.Joi.string().required(),
            colorCode: celebrate_1.Joi.string().required(),
            location: celebrate_1.Joi.string().required(),
            tags: celebrate_1.Joi.string().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling getSearch endpoint');
        try {
            const filters = {
                keyword: req.params.keyword,
                category: convertSearchPara(req.params.category),
                colorCode: convertSearchPara(req.params.colorCode),
                location: convertSearchPara(req.params.location),
                tags: convertSearchPara(req.params.tags)
            };
            const itemRecordList = await itemService.searchItem(filters);
            const result = formatItemList(itemRecordList);
            return res.status(200).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/', multerUpload.single('imgFile'), celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            gridId: celebrate_1.Joi.number().required(),
            itemId: celebrate_1.Joi.number().allow(null),
            name: celebrate_1.Joi.string().required(),
            colorCode: celebrate_1.Joi.string().required(),
            imgPath: celebrate_1.Joi.string().allow(null),
            tags: celebrate_1.Joi.string().allow(null),
            description: celebrate_1.Joi.string().allow(null),
            category: celebrate_1.Joi.string().required(),
            reminderDtm: celebrate_1.Joi.date().allow(null),
            reminderComplete: celebrate_1.Joi.boolean().allow(null)
        })
    }), async (req, res, next) => {
        logger.debug('Calling addItem endpoint');
        try {
            const input = req.body;
            input.imgPath = (req.file != null ? req.file.path : null);
            const itemRecord = await itemService.addItem(input);
            const result = formatItem(itemRecord);
            return res.status(201).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/:itemId', multerUpload.single('imgFile'), celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            gridId: celebrate_1.Joi.number().required(),
            itemId: celebrate_1.Joi.number().required(),
            name: celebrate_1.Joi.string().required(),
            colorCode: celebrate_1.Joi.string().required(),
            imgPath: celebrate_1.Joi.string().allow(null),
            tags: celebrate_1.Joi.string().allow(null),
            description: celebrate_1.Joi.string().allow(null),
            category: celebrate_1.Joi.string().required(),
            reminderDtm: celebrate_1.Joi.date().allow(null),
            reminderComplete: celebrate_1.Joi.boolean().allow(null)
        })
    }), async (req, res, next) => {
        logger.debug('Calling updateItem endpoint');
        try {
            const input = req.body;
            input.itemId = parseInt(req.params.itemId, 10);
            input.imgPath = (req.file != null ? req.file.path : null);
            const updResult = await itemService.updateItem(input);
            const result = formatItem(updResult);
            return res.status(201).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/:itemId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            itemId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling deleteItem endpoint');
        try {
            const itemId = parseInt(req.params.itemId, 10);
            const itemRecord = await itemService.deleteItem(itemId);
            const result = formatItem(itemRecord);
            return res.status(200).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/image/:itemId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            itemId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling delete item image endpoint');
        try {
            const itemId = parseInt(req.params.itemId, 10);
            const result = await itemService.deleteItemImage(itemId);
            return res.status(200).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=item.js.map