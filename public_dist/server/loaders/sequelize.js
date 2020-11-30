"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Item_1 = __importDefault(require("../models/Item"));
const Space_1 = __importDefault(require("../models/Space"));
const User_1 = __importDefault(require("../models/User"));
const Grid_1 = __importDefault(require("../models/Grid"));
const sequelize_config_json_1 = __importDefault(require("../config/sequelize-config.json"));
const env = process.env.NODE_ENV || 'development';
const dbConfig = sequelize_config_json_1.default[env];
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
sequelize.addModels([Item_1.default, Space_1.default, User_1.default, Grid_1.default]);
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map