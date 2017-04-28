const express = require('express');
const knex = require('knex');
const router = express.Router();

router.get('/api/items', (req, res) => {  
  knex('items')
  .select()
  .then((result) => {
    res.json(result);
  });
});

router.post('/api/items', (request, response) => {
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

router.get('/api/items/:id', (req, res) => {
  knex('items')
    .select()
    .where({'id': req.params.id})
    .then((result) => {
      res.status(200).json(result[0]);
    });
});

router.put('/api/items/:id', (req, res) => {
  knex('items')
    .where('id', req.params.id)
    .update({ 'title': req.body.title, 'completed': true })
    .returning(['title', 'id', 'completed'])
    .then((result) => {
      res.json(result[0]);
    });
});

router.delete('/api/items/:id', (req, res) => {
  knex('items')
    .where('id', req.params.id)
    .del()
    .then(() => {
      res.status(204).end();
    });
});

module.exports = router;
