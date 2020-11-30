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
const SpaceService_1 = __importDefault(require("../../services/SpaceService"));
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
    const spaceService = typedi_1.Container.get(SpaceService_1.default);
    function formatSpace(spaceRecord) {
        const outputSpace = {};
        const excludeAttr = ['creationDate', 'updatedOn', 'grids'];
        if (spaceRecord == null) {
            const empty = {};
            return empty;
        }
        try {
            // remove image path for display
            if (spaceRecord.imgPath != null) {
                spaceRecord.imgPath = spaceRecord.imgPath.replace(config_1.default.publicFolder, '');
            }
            // copy value from db object to transmission object
            // eslint-disable-next-line dot-notation
            for (const [key, value] of Object.entries(spaceRecord['dataValues'])) {
                if (excludeAttr.indexOf(key) < 0) {
                    // non exclude field
                    outputSpace[key] = value;
                }
            }
            // prepare grids and item tags
            let tagList = null;
            let catList = null;
            let gridCount = 0;
            let itemCount = 0;
            let tempArr = null;
            if (spaceRecord.grids != null) {
                gridCount = spaceRecord.grids.length;
                tagList = [];
                catList = [];
                for (const grid of spaceRecord.grids) {
                    // get grid's each item
                    if (grid.items != null) {
                        itemCount += grid.items.length;
                        for (const item of grid.items) {
                            // prepare unique tag list
                            if (item.tags != null) {
                                // tags stored in comma format, split to get unqiue value
                                tempArr = item.tags.split(',');
                                for (const tag of tempArr) {
                                    if (tagList.indexOf(tag.trim()) < 0) {
                                        tagList.push(tag.trim());
                                    }
                                }
                            }
                            if (item.category != null) {
                                if (catList.indexOf(item.category) < 0) {
                                    catList.push(item.category);
                                }
                            }
                        }
                    }
                }
            }
            outputSpace.gridCount = gridCount;
            outputSpace.itemCount = itemCount;
            outputSpace.itemCats = catList;
            outputSpace.itemTags = tagList;
            return outputSpace;
        }
        catch (e) {
            logger.error('Fail to prepare output space , reason: %o ', e.message);
            throw e;
        }
    }
    function formatSpaceList(spaceRecordList) {
        if (spaceRecordList == null) {
            const empty = {};
            return empty;
        }
        try {
            const outputSpaceList = [];
            if (spaceRecordList != null) {
                spaceRecordList.map((space) => {
                    outputSpaceList.push(formatSpace(space));
                });
            }
            return outputSpaceList;
        }
        catch (e) {
            logger.error('Fail to prepare output space list , reason: %o ', e.message);
            throw e;
        }
    }
    app.use('/space', route);
    route.get('/:spaceId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            spaceId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling getSpaceById endpoint');
        try {
            const spaceId = parseInt(req.params.spaceId, 10);
            const operResult = await spaceService.getSpaceById(spaceId);
            if (operResult.isSuccess) {
                operResult.payload = formatSpace(operResult.payload);
            }
            return res.status(200).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/user/:userId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            userId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling getSpaceByUserId endpoint');
        try {
            const userId = parseInt(req.params.userId, 10);
            const operResult = await spaceService.getSpaceByUserId(userId);
            if (operResult.isSuccess) {
                operResult.payload = formatSpaceList(operResult.payload);
            }
            return res.status(200).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/', multerUpload.single('imgFile'), celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            userId: celebrate_1.Joi.number().required(),
            spaceId: celebrate_1.Joi.number().allow(null),
            name: celebrate_1.Joi.string().required(),
            imgPath: celebrate_1.Joi.string().allow(null),
            location: celebrate_1.Joi.string().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling addSpace endpoint');
        try {
            const input = req.body;
            input.imgPath = (req.file != null ? req.file.path : null);
            const operResult = await spaceService.addSpace(input);
            if (operResult.isSuccess) {
                operResult.payload = formatSpace(operResult.payload);
            }
            return res.status(201).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/:spaceId', multerUpload.single('imgFile'), celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            userId: celebrate_1.Joi.number().required(),
            spaceId: celebrate_1.Joi.number().allow(null),
            name: celebrate_1.Joi.string().required(),
            imgPath: celebrate_1.Joi.string().allow(null),
            location: celebrate_1.Joi.string().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling updateSpace endpoint');
        try {
            const input = req.body;
            input.spaceId = parseInt(req.params.spaceId, 10);
            input.imgPath = (req.file != null ? req.file.path : null);
            const operResult = await spaceService.updateSpace(input);
            if (operResult.isSuccess) {
                operResult.payload = formatSpace(operResult.payload);
            }
            return res.status(201).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/:spaceId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            spaceId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling deleteSpace endpoint');
        try {
            const spaceId = parseInt(req.params.spaceId, 10);
            const operResult = await spaceService.deleteSpace(spaceId);
            if (operResult.isSuccess) {
                operResult.payload = formatSpace(operResult.payload);
            }
            return res.status(200).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/image/:spaceId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            spaceId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling delete space image endpoint');
        try {
            const spaceId = parseInt(req.params.spaceId, 10);
            const operResult = await spaceService.deleteSpaceImage(spaceId);
            return res.status(200).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=space.js.map