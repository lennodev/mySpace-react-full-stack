"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Item_1 = __importDefault(require("./Item"));
const Space_1 = __importDefault(require("./Space"));
let Grid = class Grid extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Grid.prototype, "gridId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT)
], Grid.prototype, "layout", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Item_1.default)
], Grid.prototype, "items", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Space_1.default),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Grid.prototype, "spaceId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Space_1.default)
], Grid.prototype, "space", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt
], Grid.prototype, "creationDate", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt
], Grid.prototype, "updatedOn", void 0);
Grid = __decorate([
    sequelize_typescript_1.Table
], Grid);
exports.default = Grid;
//# sourceMappingURL=Grid.js.map