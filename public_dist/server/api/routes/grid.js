"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const celebrate_1 = require("celebrate");
const GridService_1 = __importDefault(require("../../services/GridService"));
const config_1 = __importDefault(require("../../config"));
const route = express_1.Router();
exports.default = (app) => {
    // initial setup
    const logger = typedi_1.Container.get('logger');
    const gridService = typedi_1.Container.get(GridService_1.default);
    function formatSuccess(payload, message = null) {
        // eslint-disable-next-line object-shorthand
        return { isSuccess: true, payload, message };
    }
    function formatGrid(gridRecord) {
        const outputGrid = {};
        const excludeAttr = ['creationDate',
            'updatedOn',
            'space',
            'items'
        ];
        if (gridRecord == null) {
            return outputGrid;
        }
        try {
            // copy value from db object to transmission object
            // eslint-disable-next-line dot-notation
            for (const [key, value] of Object.entries(gridRecord['dataValues'])) {
                if (excludeAttr.indexOf(key) < 0) {
                    // non exclude field
                    outputGrid[key] = value;
                }
            }
            // special fill from db
            // copy img path
            if (gridRecord.space != null && gridRecord.space.imgPath != null) {
                outputGrid.imgPath = gridRecord.space.imgPath.replace(config_1.default.publicFolder, '');
            }
            else {
                outputGrid.imgPath = null;
            }
            // prepare items tags list
            let tagList = null;
            let catList = null;
            let itemCount = null;
            let tempArr = null;
            if (gridRecord.items != null) {
                itemCount = gridRecord.items.length;
                tagList = [];
                catList = [];
                for (const item of gridRecord.items) {
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
            // copy other fields
            outputGrid.layout = JSON.parse(gridRecord.layout);
            outputGrid.itemCats = catList;
            outputGrid.itemTags = tagList;
            outputGrid.itemCount = itemCount;
            return outputGrid;
        }
        catch (e) {
            logger.error('Fail to prepare output grid list , reason: %o ', e.message);
            throw e;
        }
    }
    function formatGridList(gridRecordList) {
        if (gridRecordList == null) {
            const empty = {};
            return empty;
        }
        try {
            const outputList = [];
            if (gridRecordList != null) {
                for (const grid of gridRecordList) {
                    outputList.push(formatGrid(grid));
                }
            }
            return outputList;
        }
        catch (e) {
            logger.error('Fail to prepare output grid list , reason: %o ', e.message);
            throw e;
        }
    }
    app.use('/grid', route);
    route.get('/space/:spaceId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            spaceId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling getGridBySpaceId endpoint');
        try {
            const spaceId = parseInt(req.params.spaceId, 10);
            const gridRecordList = await gridService.getGridBySpaceId(spaceId);
            const result = formatGridList(gridRecordList);
            return res.status(200).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            grids: celebrate_1.Joi.array().items(celebrate_1.Joi.object({
                spaceId: celebrate_1.Joi.number().required(),
                gridId: celebrate_1.Joi.number().allow(null),
                layout: celebrate_1.Joi.object({
                    x: celebrate_1.Joi.number().required(),
                    y: celebrate_1.Joi.number().required(),
                    w: celebrate_1.Joi.number().required(),
                    h: celebrate_1.Joi.number().required(),
                    i: celebrate_1.Joi.string().required(),
                    minW: celebrate_1.Joi.number()
                })
            }))
        })
    }), async (req, res, next) => {
        logger.debug('Calling addGrid endpoint');
        try {
            const input = req.body.grids;
            const gridRecord = await gridService.saveGrid(input);
            const result = formatGridList(gridRecord);
            return res.status(201).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/:gridId', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            gridId: celebrate_1.Joi.number().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling deleteGrid endpoint');
        try {
            const gridId = parseInt(req.params.gridId, 10);
            const gridRecord = await gridService.deleteGrid(gridId);
            const result = formatGrid(gridRecord); // pass in as list
            return res.status(200).json(formatSuccess(result));
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=grid.js.map