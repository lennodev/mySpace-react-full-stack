"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const User_1 = __importDefault(require("../models/User"));
const Role_1 = __importDefault(require("../constants/Role"));
const MessageCd_1 = __importDefault(require("../constants/MessageCd"));
const operationResult_1 = __importDefault(require("../util/operationResult"));
let UserService = class UserService {
    constructor() {
        this.logger = typedi_1.Container.get('logger');
        this.userRepo = typedi_1.Container.get('sequelize').getRepository(User_1.default);
    }
    async register(userTrans) {
        try {
            const operResult = new operationResult_1.default();
            const userRecord = await this.userRepo.findOne({ where: { email: userTrans.email } });
            if (userRecord) {
                this.logger.error('Fail to create user, Email already registered');
                operResult.setFail(MessageCd_1.default.USER_EMAIL_ALREADY_EXIST, 'Fail to create user, Email already registered');
                return operResult;
            }
            userTrans.role = Role_1.default.ROLE_BASIC_USER;
            userTrans.password = bcrypt.hashSync(userTrans.password, 8);
            const newUser = await this.userRepo.create(userTrans);
            operResult.setSuccess(newUser);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to create user, reason: %o ', e.message);
            throw e;
        }
    }
    async login(userTrans) {
        try {
            const operResult = new operationResult_1.default();
            const userRecord = await this.userRepo.findOne({ where: { email: userTrans.email } });
            if (!userRecord) {
                this.logger.error('Email or password incorrect');
                operResult.setFail(MessageCd_1.default.USER_LOGIN_INVALID_CREDENTIAL, 'Fail to login, Email or password incorrect');
                return operResult;
            }
            // check password with hash
            const isPswdValid = bcrypt.compareSync(userTrans.password, userRecord.password);
            if (!isPswdValid) {
                this.logger.error('Email or password incorrect');
                operResult.setFail(MessageCd_1.default.USER_LOGIN_INVALID_CREDENTIAL, 'Fail to login, Email or password incorrect');
                return operResult;
            }
            // create JWT token
            const authTrans = {};
            authTrans.isAuthenticated = true;
            authTrans.name = userRecord.name;
            authTrans.userId = userRecord.userId;
            // sign token
            authTrans.token = jsonwebtoken_1.default.sign({ userId: userRecord.userId, name: userRecord.name }, config_1.default.jwtSecret, { expiresIn: config_1.default.tokenExpireMins });
            operResult.setSuccess(authTrans);
            return operResult;
        }
        catch (e) {
            this.logger.error('Fail to login, reason: %o ', e.message);
            throw e;
        }
    }
};
UserService = __decorate([
    typedi_1.Service()
], UserService);
exports.default = UserService;
//# sourceMappingURL=UserService.js.map