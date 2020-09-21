import https from 'https';
import fs from 'fs';
import config from './config';
import Logger from './loaders/logger';


async function startServer() {
  const credentials = {
    key: fs.readFileSync('./certs/server-key.pem'),
    cert: fs.readFileSync('./certs/server-cert.pem')
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

  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(config.port, () => {
    // if (err) {
    //   Logger.error(err);
    //   process.exit(1);
    //   return;
    // }
    Logger.info(`
            ################################################
            🛡️  Server listening on port: ${config.port} 🛡️
            ################################################
            `);
  });
}

startServer();
