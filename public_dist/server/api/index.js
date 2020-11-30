"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const item_1 = __importDefault(require("./routes/item"));
const space_1 = __importDefault(require("./routes/space"));
const grid_1 = __importDefault(require("./routes/grid"));
const auth_1 = __importDefault(require("./routes/auth"));
// guaranteed to get dependencies
exports.default = () => {
    const app = express_1.Router();
    space_1.default(app);
    item_1.default(app);
    grid_1.default(app);
    auth_1.default(app);
    return app;
};
//# sourceMappingURL=index.js.map