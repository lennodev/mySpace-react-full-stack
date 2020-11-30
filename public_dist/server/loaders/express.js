"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const helmet_1 = __importDefault(require("helmet"));
const api_1 = __importDefault(require("../api"));
const config_1 = __importDefault(require("../config"));
const passport_2 = __importDefault(require("./passport"));
exports.default = ({ app }) => {
    app.use(helmet_1.default());
    app.get('/status', (req, res) => {
        res.status(200).end();
    });
    app.head('/status', (req, res) => {
        res.status(200).end();
    });
    app.enable('trust proxy');
    app.use(cors_1.default());
    app.use(body_parser_1.default.json({ limit: '5mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '5mb', extended: true }));
    app.use(passport_1.default.initialize());
    passport_1.default.use(passport_2.default);
    app.use(require('method-override')());
    app.use(morgan_1.default(config_1.default.mogran.level));
    // Load API routes
    app.use(config_1.default.api.prefix, api_1.default());
    // set static path
    app.use(express_1.default.static(config_1.default.publicFolder));
    // / catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error('Endpoint Not Found');
        // eslint-disable-next-line dot-notation
        err['status'] = 404;
        next(err);
    });
    // / error handlers
    app.use((err, req, res, next) => {
        /**
         * Handle 401 thrown by express-jwt library
         */
        if (err.name === 'Unauthorized') {
            return res
                .status(err.status)
                .send({ message: err.message })
                .end();
        }
        return next(err);
    });
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            isSuccess: false,
            payload: null,
            message: err.message
        });
    });
};
//# sourceMappingURL=express.js.map