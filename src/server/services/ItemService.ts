import { Sequelize, Repository } from 'sequelize-typescript';
import { Service, Container } from 'typedi';
import moment from 'moment';
import winston from 'winston';
import { Op } from 'sequelize';
import config from '../config';
import SearchTrans from '../interfaces/SearchTrans';
import ItemTrans from '../interfaces/ItemTrans';
// import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
// import events from '../subscribers/events';
import * as fileUtil from '../util/fileUtil';

// test for postgresql and sequelize
import Grid from '../models/Grid';
import Item from '../models/Item';
import Space from '../models/Space';
import grid from '../api/routes/grid';


@Service()
export default class ItemService {
  private logger:winston.Logger;

  private itemRepo:Repository<Item>;

  private spaceRepo: Repository<Space>;

  private gridRepo: Repository<Grid>;

  constructor() {
    this.logger = Container.get<winston.Logger>('logger');
    this.itemRepo = Container.get<Sequelize>('sequelize').getRepository<Item>(Item);
    this.gridRepo = Container.get<Sequelize>('sequelize').getRepository<Grid>(Grid);
    this.spaceRepo = Container.get<Sequelize>('sequelize').getRepository<Space>(Space);
  }

  public async getItemByGridId(gridId: number): Promise<Item[]> {
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
    } catch (e) {
      this.logger.error('Fail to get item list, reason: %o ', e.message);
      throw e;
    }
  }

  public async getItemById(itemId: number): Promise<Item> {
    try {
      const itemRecord = await this.itemRepo.findOne({ where: { itemId } });
      return itemRecord;
    } catch (e) {
      this.logger.error('Fail to get item, reason: %o ', e.message);
      throw e;
    }
  }


  public async addItem(itemTrans: ItemTrans): Promise<Item> {
    try {
      this.logger.debug('add item record');

      // move file to new path
      if (itemTrans.imgPath != null) {
        const newFilePath = fileUtil.moveFileToPath(itemTrans.imgPath, config.fileUpload.imgItemPath);
        itemTrans.imgPath = newFilePath;
      }

      // set reminder complete
      if (itemTrans.reminderDtm != null) {
        // assume reminder not yet complete
        itemTrans.reminderComplete = false;
      } else {
        itemTrans.reminderComplete = null;
      }

      const itemRecord = await this.itemRepo.create(itemTrans);

      if (!itemRecord) {
        this.logger.error('Fail to create item');
        throw new Error('Item cannot be created');
      }
      // this.eventDispatcher.dispatch(events.user.signUp, { user: itemRecord });

      return itemRecord;
    } catch (e) {
      this.logger.error('Fail to add item, reason: %o ', e.message);
      throw e;
    }
  }

  public async updateItem(itemTrans: ItemTrans): Promise<Item> {
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
          const oldRemind = moment(itemRecord.reminderDtm);
          const newRemind = moment(itemTrans.reminderDtm);
          if (oldRemind.diff(newRemind, 'seconds', true) === 0) {
            // no change
            itemTrans.reminderComplete = itemTrans.reminderComplete;
          }
        }
      } else {
        itemTrans.reminderComplete = null;
      }

      // handle image file
      if (itemTrans.imgPath != null) {
        // if new image file is uploaded
        // move file to new path
        const newFilePath = fileUtil.moveFileToPath(itemTrans.imgPath, config.fileUpload.imgItemPath);
        itemTrans.imgPath = newFilePath;
      } else {
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

      const updResult:any = await this.itemRepo.update(update, options);

      if (!updResult) {
        this.logger.error('Fail to update item');
        throw new Error('Item cannot be updated');
      }

      // remove images between new and old is different
      if (updResult && itemTrans.imgPath !== itemRecord.imgPath) {
        fileUtil.clearUploadFile(itemRecord.imgPath);
      }
      return updResult[1];
    } catch (e) {
      this.logger.error('Fail to update item, itemId: %o, reason: %o ', itemTrans.itemId, e.message);
      throw e;
    }
  }

  public async deleteItem(itemId: number): Promise<Item> {
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
      } else {
        this.logger.error('Fail to delete item, itemId %o ', itemId);
        throw new Error('Fail to delete item');
      }
      return itemRecord;
    } catch (e) {
      this.logger.error('Fail to delete item, itemId: %o, reason: %o ', itemId, e.message);
      throw e;
    }
  }


  public async deleteItemImage(itemId: number): Promise<boolean> {
    let result: boolean = false;
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

      const updResult:any = await this.itemRepo.update(update, options);

      if (!updResult) {
        this.logger.error('Fail to update item image to null');
        throw new Error('Item image cannot be updated to null');
      }

      // remove old img
      result = fileUtil.clearUploadFile(itemRecord.imgPath);

      return result;
    } catch (e) {
      this.logger.error('Fail to delete item image, itemId: %o, reason: %o ', itemId, e.message);
      throw e;
    }
  }

  public async searchItem(filters: SearchTrans): Promise<Item[]> {
    try {
      // prepare where cause for optional criterias
      const andList: any[] = [];
      if (filters.category != null) {
        andList.push({ category: filters.category });
      }

      if (filters.colorCode != null) {
        andList.push({ colorCode: filters.colorCode });
      }

      if (filters.tags != null) {
        andList.push({ tags: { [Op.iLike]: `%${filters.tags}%` } });
      }

      // where in parent parent column (item->grid->space .location)
      if (filters.location != null) {
        andList.push({ '$grid.space.location$': filters.location });
      }

      // prepare keyword in name and description fields

      const whereCause:any = {
        [Op.and]: andList,
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${filters.keyword}%`
            }
          }, {
            description: {
              [Op.iLike]: `%${filters.keyword}%`
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
    } catch (e) {
      this.logger.error('Fail to search item, reason: %o ', e.message);
      throw e;
    }
  }
}
