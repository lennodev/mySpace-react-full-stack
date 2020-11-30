"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
module.exports = (async function () {
    const app = express_1.default();
    await require('./loaders').default({ expressApp: app });
    return app;
}());
//# sourceMappingURL=app.js.map