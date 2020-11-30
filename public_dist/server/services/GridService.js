"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
// test for postgresql and sequelize
const Grid_1 = __importDefault(require("../models/Grid"));
const Item_1 = __importDefault(require("../models/Item"));
const Space_1 = __importDefault(require("../models/Space"));
let GridService = class GridService {
    constructor() {
        this.logger = typedi_1.Container.get('logger');
        this.gridRepo = typedi_1.Container.get('sequelize').getRepository(Grid_1.default);
        this.itemRepo = typedi_1.Container.get('sequelize').getRepository(Item_1.default);
        this.spaceRepo = typedi_1.Container.get('sequelize').getRepository(Space_1.default);
    }
    async getGridBySpaceId(spaceId) {
        try {
            // get assoicated item tags
            const gridRecordList = await this.gridRepo.findAll({
                where: { spaceId },
                include: [{
                        model: this.itemRepo,
                        as: 'items',
                        attributes: ['itemId', 'tags', 'category']
                    }, {
                        model: this.spaceRepo,
                        as: 'space',
                        attributes: ['imgPath']
                    }],
                order: [['gridId', 'ASC']]
            });
            return gridRecordList;
        }
        catch (e) {
            this.logger.error('Fail to get grid list, reason: %o ', e.message);
            throw e;
        }
    }
    async saveGrid(gridTransList) {
        try {
            this.logger.debug('save grid record');
            let gridItem;
            let result = null;
            let idx;
            const gridList = [];
            // add all grids to db
            for (const gridTrans of gridTransList) {
                // prepare grid by for each layout
                gridItem = {
                    spaceId: gridTrans.spaceId,
                    layout: gridTrans.layout,
                    gridId: gridTrans.gridId
                };
                if (gridTrans.gridId === null) {
                    // new grid
                    result = this.addGrid(gridItem);
                }
                else {
                    // existing grid
                    result = this.updateGrid(gridItem);
                }
                if (!result) {
                    this.logger.error('Fail to save grid');
                    throw new Error('Grid cannot be saved');
                }
                // store as list for return
                gridList.push(result);
            }
            // wait for all complete
            await Promise.all(gridList);
            // instead of returing save/update result directly
            // return gridList by using select function to populate item tags
            return await this.getGridBySpaceId(gridTransList[0].spaceId);
        }
        catch (e) {
            this.logger.error('Fail to save grid, reason: %o ', e.message);
            throw e;
        }
    }
    async addGrid(grid) {
        try {
            this.logger.debug('add grid record');
            if (grid.layout === null) {
                this.logger.error('Fail to create grid');
                throw new Error('Grid cannot be created');
            }
            const tempLayout = Object.assign({}, grid.layout); // copy json for later update i value
            grid.layout = JSON.stringify(grid.layout); // convert json to string for storing purpose
            const result = await this.gridRepo.create(grid);
            if (!result) {
                this.logger.error('Fail to create grid');
                throw new Error('Grid cannot be created');
            }
            // update grid id for new grid item
            tempLayout.i = `${result.gridId}`; // convert integer to string
            result.layout = tempLayout;
            const updResult = this.updateGrid(result);
            if (!updResult) {
                this.logger.error('Fail to update grid id in layout');
                throw new Error('Grid cannot be created');
            }
            return updResult;
        }
        catch (e) {
            this.logger.error('Fail to add grid, reason: %o ', e.message);
            throw e;
        }
    }
    async updateGrid(grid) {
        try {
            const filter = {
                where: { gridId: grid.gridId }
            };
            this.logger.debug('update grid record, gridId: %o', grid.gridId);
            const gridRecord = await this.gridRepo.findOne(filter);
            if (!gridRecord) {
                this.logger.error('Fail to find grid, gridId %o ', grid.gridId);
                throw new Error('Grid not found');
            }
            const update = {
                layout: JSON.stringify(grid.layout) // convert json to string for storing purpose
            };
            // update record
            const options = {
                where: { gridId: grid.gridId },
                returning: true,
                plain: true
            };
            const updResult = await this.gridRepo.update(update, options);
            if (!updResult) {
                this.logger.error('Fail to update grid');
                throw new Error('Grid cannot be updated');
            }
            return updResult[1];
        }
        catch (e) {
            this.logger.error('Fail to update grid, gridId: %o, reason: %o ', grid.gridId, e.message);
            throw e;
        }
    }
    async deleteGrid(gridId) {
        try {
            this.logger.debug('delete grid record, gridId: %o', gridId);
            const gridRecord = await this.gridRepo.findOne({ where: { gridId } });
            if (!gridRecord) {
                this.logger.error('Fail to find grid, gridId %o ', gridId);
                throw new Error('Grid not found');
            }
            const options = {
                where: { gridId },
                limit: 1
            };
            const delOper = await this.gridRepo.destroy(options);
            if (!delOper) {
                this.logger.error('Fail to delete grid, gridId %o ', gridId);
                throw new Error('Fail to delete grid');
            }
            return gridRecord;
        }
        catch (e) {
            this.logger.error('Fail to delete grid, gridId: %o, reason: %o ', gridId, e.message);
            throw e;
        }
    }
};
GridService = __decorate([
    typedi_1.Service()
], GridService);
exports.default = GridService;
//# sourceMappingURL=GridService.js.map