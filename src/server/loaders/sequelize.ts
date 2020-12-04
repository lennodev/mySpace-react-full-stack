import { Sequelize } from 'sequelize-typescript';



import fs from 'fs';



import Item from '../models/Item';



import Space from '../models/Space';



import User from '../models/User';



import Grid from '../models/Grid';



// import SeqConfig from '/app_configs/db/db_conn.json';





let dbConfig = null;



try {

  const dbConnPath = './db_conn.json';



  // if (!fs.existsSync(dbConnPath)) {



  //   // use local



  //   dbConnPath = '../db_conn.json';



  //   console.log('Using local db connection');



  // }





  const rawdata = fs.readFileSync(dbConnPath);



  const dbConnInfo = JSON.parse(rawdata.toString());





  const env = process.env.NODE_ENV || 'development';



  dbConfig = dbConnInfo[env];

} catch (err) {

  console.error(err);

}





const sequelize:Sequelize = new Sequelize(dbConfig);





sequelize.addModels([Item, Space, User, Grid]);





export default sequelize;

