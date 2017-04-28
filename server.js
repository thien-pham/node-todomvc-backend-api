const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');

const itemsRoutes = require('./routes/api_items');

const app = express();
app.use(bodyParser.json());

// ADD EXPRESS MIDDLEWARE FOR CORS HEADERS HERE
app.use(function(req, res, next) {  
  if (require.main === module) {
    res.header('Access-Control-Allow-Origin', req.get('origin'));
  } 
  else {
    res.header('Access-Control-Allow-Origin', 'http://chai-http.test');
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

app.use('/', itemsRoutes);


// ADD GET POST PUT DELETE ENDPOINTS HERE
let server;
let knex;
function runServer(database = DATABASE, port = PORT) {
  return new Promise((resolve, reject) => {
    try {
      knex = require('knex')(database);
      server = app.listen(port, () => {
        console.info(`App listening on port ${server.address().port}`);
        resolve();
      });
    }
    catch (err) {
      console.error(`Can't start server: ${err}`);
      reject(err);
    }
  });
}

function closeServer() {
  return knex.destroy().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing servers');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => {
    console.error(`Can't start server: ${err}`);
    throw err;
  });
}


module.exports = { app, runServer, closeServer };