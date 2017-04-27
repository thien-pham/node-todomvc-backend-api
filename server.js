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

app.post('/api/items', (req, res) => {
  knex('todo')
  .insert({'task': req.body.task})
  .returning(['id', 'task'])
  .then( (results) => { res.status(201).location(`${res.root}${results[0].id}`).json(results[0]); } );
  //   .returning(['id', 'task'])
  //   .then(() => {
      // console.log('Yolo');
      //console.log(result);
      //res.status(201).json(result);
      //req.get('origin');
    // });
});

/* 
app.post('/api/stories', (req,res)=>{
  knex('posts').insert({'title':req.body.title,'url':req.body.url,'votes':1})
  .returning(['id','title'])
  .then(e=>{
    res.status(201).json(e);
  });
  //console.log(req.body);
  //res.json(req.body)

});
*/

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