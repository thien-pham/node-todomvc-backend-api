const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');

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

// ADD GET POST PUT DELETE ENDPOINTS HERE
app.get('/api/items', (req, res) => {  
  knex('items')
  .select()
  .then((result) => {
    res.json(result);
  });
});

app.post('/api/items', (request, response) => {
  if(!('title' in request.body)) {
    return response.sendStatus(400);
  }
  
  knex('items')
    .insert({'title': request.body.title, 'url': request.url})
    .returning(['id', 'title', 'url', 'completed'])
    .then( (result) => {
      const titleUrl = `${result[0].url}/${result[0].id}`;
      result[0].url = `localhost:8080${titleUrl}`;      
      response.status(201).location(result[0].url).json(result[0]); 
    });
});

app.get('/api/items/:id', (req, res) => {
  knex('items')
    .select()
    .where({'id': req.params.id})
    .then((result) => {
      console.log(result);
      res.status(200).json(result[0]);
    });
});

app.put('/api/items/:id', (req, res) => {
  knex('items')
    .where('id', req.params.id)
    .update({ 'title': req.body.title, 'completed': true })
    .returning(['title', 'id', 'completed'])
    .then((result) => {
      res.json(result[0]);
    });
});

app.delete('/api/items/:id', (req, res) => {
  knex('items')
    .where('id', req.params.id)
    .del()
    .then(() => {
      res.status(204).end();
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