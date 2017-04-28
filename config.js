// require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'postgresql://dev:dev@localhost/todos-app';

exports.DATABASE = {
  client: 'pg',
  connection: DATABASE_URL,
  //debug: true,
  pool: { min: 0, max: 5 }
};

exports.PORT = process.env.PORT || 8080; 

