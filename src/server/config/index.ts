import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  databaseURL: (process.env.RUN_MODE=='TEST'? process.env.MONGODB_URI+'-TEST': process.env.MONGODB_URI),

  /**
   * Your secret sauce
   */
  jwtSecret: process.env.JWT_SECRET,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  
  /**
   * Used by morgan logger
   */
  mogran: {
    level: process.env.MORGAN_LEVEL || 'dev',
  },

  /**
   * API configs
   */
  api: {
    prefix: '/api',
  },

  /**
   * Used by display
   */
  publicFolder: process.env.PUBLIC_FOLDER,
  

  /**
   * upload configs
   */
  fileUpload:{
    tempPath: process.env.FILE_UPLOAD_TEMP_PATH,
    imgItemPath: process.env.FILE_UPLOAD_IMG_ITEM_PATH,
    maxSize: (1024 * 1024 * parseInt(process.env.FILE_UPLOAD_MAX_SIZE,10)),  
    fileType: ['.png','.jpg','.jpeg','gif']
  }

};