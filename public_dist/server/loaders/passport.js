"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const passport_jwt_1 = require("passport-jwt");
const config_1 = __importDefault(require("../config"));
// import User from '../models/user.model'
const User_1 = __importDefault(require("../models/User"));
const ops = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config_1.default.jwtSecret
};
// validate userId in JWT token is exist in database
exports.default = new passport_jwt_1.Strategy(ops, async (payload, done) => {
    const logger = typedi_1.Container.get('logger');
    try {
        logger.debug('Calling passport Strategy to retrieve user from DB by userId');
        const UserRepo = typedi_1.Container.get('sequelize').getRepository(User_1.default);
        // check user exist in db
        const userRecord = await UserRepo.findOne({ attributes: ['userId', 'name', 'role'], where: { userId: payload.userId } });
        if (userRecord) {
            return done(null, userRecord);
        }
        done(null, false);
    }
    catch (e) {
        logger.error('Fail to get user, reason: %o ', e.message);
        throw e;
    }
});
//# sourceMappingURL=passport.js.map