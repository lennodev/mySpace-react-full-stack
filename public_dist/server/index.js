"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./loaders/logger"));
async function startServer() {
    const credentials = {
        key: fs_1.default.readFileSync('./certs/server-key.pem'),
        cert: fs_1.default.readFileSync('./certs/server-cert.pem')
    };
    const app = await require('./app');
    //   app.listen(config.port, (err) => {
    //     if (err) {
    //       Logger.error(err);
    //       process.exit(1);
    //       return;
    //     }
    //     Logger.info(`
    //           ################################################
    //           🛡️  Server listening on port: ${config.port} 🛡️
    //           ################################################
    //           `);
    //   });
    const httpsServer = https_1.default.createServer(credentials, app);
    httpsServer.listen(config_1.default.port, () => {
        // if (err) {
        //   Logger.error(err);
        //   process.exit(1);
        //   return;
        // }
        logger_1.default.info(`
            ################################################
            🛡️  Server listening on port: ${config_1.default.port} 🛡️
            ################################################
            `);
    });
}
startServer();
//# sourceMappingURL=index.js.map