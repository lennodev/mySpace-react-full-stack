"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const celebrate_1 = require("celebrate");
const passport_1 = __importDefault(require("passport"));
const UserService_1 = __importDefault(require("../../services/UserService"));
const route = express_1.Router();
exports.default = (app) => {
    // initial setup
    const logger = typedi_1.Container.get('logger');
    const userService = typedi_1.Container.get(UserService_1.default);
    function formatUser(userRecord) {
        const outputItem = {};
        const excludeAttr = ['creationDate',
            'updatedOn',
            'password'
        ];
        if (userRecord == null) {
            const empty = {};
            return empty;
        }
        try {
            // copy value from db object to transmission object
            // eslint-disable-next-line dot-notation
            for (const [key, value] of Object.entries(userRecord['dataValues'])) {
                if (excludeAttr.indexOf(key) < 0) {
                    // non exclude field
                    outputItem[key] = value;
                }
            }
            return outputItem;
        }
        catch (e) {
            logger.error('Fail to prepare output item , reason: %o ', e.message);
            throw e;
        }
    }
    app.use('/auth', route);
    route.post('/register', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            email: celebrate_1.Joi.string().email().required(),
            name: celebrate_1.Joi.string().required(),
            password: celebrate_1.Joi.string().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling register endpoint');
        try {
            const input = req.body;
            const operResult = await userService.register(input);
            if (operResult.isSuccess) {
                operResult.payload = formatUser(operResult.payload);
            }
            return res.status(201).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/login', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            email: celebrate_1.Joi.string().email().required(),
            password: celebrate_1.Joi.string().required()
        })
    }), async (req, res, next) => {
        logger.debug('Calling login endpoint');
        const input = req.body;
        try {
            const operResult = await userService.login(input);
            return res.status(201).json(operResult);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/public', async (req, res, next) => {
        logger.debug(`Calling public endpoint${JSON.stringify(req.user)}`);
        res.send(`Success ${new Date()}`);
    });
    route.get('/restricted', passport_1.default.authenticate('jwt', { session: false }), async (req, res, next) => {
        logger.debug(`Calling restricted endpoint ${JSON.stringify(req.user)}`);
        const currUser = req.user;
        logger.debug(`${currUser.userId} - ${currUser.role}`);
        res.send('Success');
    });
};
//# sourceMappingURL=auth.js.map