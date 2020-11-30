"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const express_1 = __importDefault(require("./express"));
const logger_1 = __importDefault(require("./logger"));
const sequelize_1 = __importDefault(require("./sequelize"));
exports.default = async ({ expressApp }) => {
    await sequelize_1.default.sync({});
    typedi_1.Container.set('sequelize', sequelize_1.default);
    logger_1.default.info('✌️ Postgresql DB loaded and connected!');
    typedi_1.Container.set('logger', logger_1.default);
    logger_1.default.info('✌️ Logger injected into container');
    await express_1.default({ app: expressApp });
    logger_1.default.info('✌️ Express loaded');
};
//# sourceMappingURL=index.js.map