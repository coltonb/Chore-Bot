const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot.js');
const models = require('./models');

const { Chore } = models;
const { Group } = models;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  const groups = await Group.findAll({ order: [['id', 'ASC']] });
  const chores = await Chore.findAll({ order: [['id', 'ASC']] });
  res.render('index', { groups, chores });
});

app.get('/chores', async (req, res) => {
  res.redirect('/');
});

app.post('/', (req) => {
  bot.respond(req.body);
});

app.post('/chores/:id/do', async (req, res) => {
  const { id } = req.params;
  const response = await Chore.update({ status: true }, { where: { id } });
  const rows = JSON.parse(response);
  if (rows === 1) {
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

app.post('/chores/:id/undo', async (req, res) => {
  const { id } = req.params;
  const response = await Chore.update({ status: false }, { where: { id } });
  const rows = JSON.parse(response);
  if (rows === 1) {
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

const port = Number(process.env.PORT || 5000);
app.listen(port);
