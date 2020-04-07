import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import winston from 'winston';
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';
import { IItemInputDTO, IItem } from '../../interfaces/IItem';
import ItemService from '../../services/item';
import * as multerOptions from '../../config/multer';
import config from '../../config';
import { Document } from 'mongoose';
import Item from '../../models-seq/Item';
const route = Router();

export default (app: Router) => {
  //initial setup
  //prepare file upload
  const multerUpload = multer({ 
     storage: multer.diskStorage(multerOptions.storageOptions),
     limits: multerOptions.fileSizeFilter,
     fileFilter: multerOptions.fileTypeFilter
  });
  const logger:winston.Logger = Container.get('logger');  
  const itemService = Container.get(ItemService);  

  app.use('/item', route);

  route.get(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling getItemById endpoint');

      return res.status(200).json({ result:{itemId:1} });
  });
  
  route.get(
    '/:itemId',
    celebrate({
      params: Joi.object({
        itemId: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling getItemById endpoint');

      try {
        const itemId = parseInt(req.params.itemId,10);
        const itemRecord = await itemService.getItemById2(itemId);
        const result = formatItem2(itemRecord);
        return res.status(200).json(formatSuccess(result));
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
  });

  
  route.get(
    '/space/:spaceId',
    celebrate({
      params: Joi.object({
        spaceId: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling getItemBySpaceId endpoint')

      try {
        const spaceId = parseInt(req.params.spaceId,10);
        const itemRecordList = await itemService.getItemBySpaceId2(spaceId);
        const result = formatItemList2(itemRecordList);
        return res.status(200).json(formatSuccess(result));
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
  });
  
  route.post(
    '/',
    multerUpload.single('imgFile'),
    celebrate({
      body: Joi.object({
        spaceId: Joi.number().required(),
        itemId: Joi.number().allow(null),
        name: Joi.string().required(),
        colorCode: Joi.string().required(),
        imgPath: Joi.string().allow(null),
        tags: Joi.string().allow(null),
        description: Joi.string().allow(null),
        category: Joi.string().required(),
        reminderDtm: Joi.date().allow(null),
        reminderComplete: Joi.boolean().allow(null),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling addItem endpoint');

      try {
        let input:IItemInputDTO = req.body;
        input.imgPath = (req.file!=null?req.file.path:null);
        const itemRecord = await itemService.addItem2(input);
        const result = formatItem2(itemRecord);
        return res.status(201).json(formatSuccess(result));
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  );

  route.put(
    '/:itemId',
    multerUpload.single('imgFile'),
    celebrate({
      body: Joi.object({
        spaceId: Joi.number().required(),
        itemId: Joi.number().required(),
        name: Joi.string().required(),
        colorCode: Joi.string().required(),
        imgPath: Joi.string().allow(null),
        tags: Joi.string().allow(null),
        description: Joi.string().allow(null),
        category: Joi.string().required(),
        reminderDtm: Joi.date().allow(null),
        reminderComplete: Joi.boolean().allow(null),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling updateItem endpoint')

      try {
        let input:IItemInputDTO = req.body;
        input.itemId = parseInt(req.params.itemId);
        input.imgPath = (req.file!=null?req.file.path:null);
        const updResult = await itemService.updateItem2(input);
        const result = formatItem2(updResult);
        return res.status(201).json(formatSuccess(result));
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  );

  
  route.delete(
    '/:itemId',
    celebrate({
      params: Joi.object({
        itemId: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling deleteItem endpoint')

      try {
        const itemId = parseInt(req.params.itemId,10);
        const itemRecord = await itemService.deleteItem2(itemId);
        const result = formatItem2(itemRecord);
        return res.status(200).json(formatSuccess(result));
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
  });

  
  route.delete(
    '/image/:itemId',
    celebrate({
      params: Joi.object({
        itemId: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling delete item image endpoint')

      try {
        const itemId = parseInt(req.params.itemId,10);
        const result = await itemService.deleteItemImage2(itemId);
        return res.status(200).json(formatSuccess(result));
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
  });

  function formatSuccess(payload:any, message:string = null):object{
    return {isSuccess:true, payload: payload, message: message};
  }

  function formatItemList2(itemRecordList: (Item)[]): Item[] {
    logger.debug('format item list');

    if (itemRecordList == null) {
      let empty:any = {};
      return empty;
    }

    try {
      let itemList: Item[] = [];
      if (itemRecordList != null) {
        itemRecordList.map((item) => {
          itemList.push(formatItem2(item));
        });
      }
      return itemList;
    } catch (e) {
      logger.error('Fail to prepare output item list , reason: %o ', e.message);
      throw e;
    }
  }

  function formatItem2(itemRecord: Item): Item {
    logger.debug('format item');

    if (itemRecord == null) {
      let empty:any = {};
      return empty;
    }

    try {

      //remove image path for display
      if(itemRecord.imgPath!=null){
        itemRecord.imgPath = itemRecord.imgPath.replace(config.publicFolder,'');
      }
      
      Reflect.deleteProperty(itemRecord, 'creationDate');
      Reflect.deleteProperty(itemRecord, 'updatedOn');
      return itemRecord;
    } catch (e) {
      logger.error('Fail to prepare output item , reason: %o ', e.message);
      throw e;
    }
  }

};
