import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import winston from 'winston';
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';
import { IItemInputDTO } from '../../interfaces/IItem';
import ItemService from '../../services/item';
import * as multerOptions from '../../config/multer';
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
        const { result } = await itemService.getItemById(itemId);
        return res.status(201).json({ result });
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
        const { result } = await itemService.addItem(input);
        return res.status(201).json({ result });
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
        const { result } = await itemService.updateItem(input);
        return res.status(201).json({ result });
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
        const { result } = await itemService.deleteItem(itemId);
        return res.status(201).json({ result });
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
        const { result } = await itemService.deleteItemImage(itemId);
        return res.status(201).json({ result });
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
        const { result } = await itemService.getItemBySpaceId(spaceId);
        return res.status(201).json({ result });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
  });

};
