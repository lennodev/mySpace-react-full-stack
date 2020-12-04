"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const fs_1 = __importDefault(require("fs"));
const Item_1 = __importDefault(require("../models/Item"));
const Space_1 = __importDefault(require("../models/Space"));
const User_1 = __importDefault(require("../models/User"));
const Grid_1 = __importDefault(require("../models/Grid"));
// import SeqConfig from '/app_configs/db/db_conn.json';
let dbConfig = null;
try {
    const dbConnPath = './db_conn.json';
    // if (!fs.existsSync(dbConnPath)) {
    //   // use local
    //   dbConnPath = '../db_conn.json';
    //   console.log('Using local db connection');
    // }
    const rawdata = fs_1.default.readFileSync(dbConnPath);
    const dbConnInfo = JSON.parse(rawdata.toString());
    const env = process.env.NODE_ENV || 'development';
    dbConfig = dbConnInfo[env];
}
catch (err) {
    console.error(err);
}
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
sequelize.addModels([Item_1.default, Space_1.default, User_1.default, Grid_1.default]);
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map