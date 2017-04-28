const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');

const app = express();
app.use(bodyParser.json());

// ADD EXPRESS MIDDLEWARE FOR CORS HEADERS HERE
app.use(function(req, res, next) {   
  res.header('Access-Control-Allow-Origin', 'http://chai-http.test');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

// ADD GET POST PUT DELETE ENDPOINTS HERE
app.get('/api/items', (req, res) => {  
  knex('todo')
  // .select(['id','task','done'])
  .select()
  .then((result) => {
    //do we need return
    res.json(result);
  });
});

app.post('/api/items', (request, response) => {
  if(!('task' in request.body)) {
    return response.sendStatus(400);
  }
  
  knex('todo')
    .insert({'task': request.body.task, 'url': request.url})
    .returning(['id', 'task', 'url', 'done'])
    .then( (result) => {
      const taskUrl = `${result[0].url}/${result[0].id}`;
      result[0].url = `localhost:8080${taskUrl}`;      
      response.status(201).location(result[0].url).json(result[0]); 
    });
});

app.get('/api/items/:id', (req, res) => {
  knex('todo')
    .select()
    .where({'id': req.params.id})
    .then((result) => {
      res.status(200).json(result[0]);
    });
});


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