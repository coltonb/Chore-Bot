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

app.post('/', (req) => {
  bot.respond(req.body);
});

app.post('/do/:id', async (req) => {
  const { id } = req.params;
  const chore = await Chore.find({ where: { id } });
  chore.status = true;
  chore.save({ fields: ['status'] });
});

app.post('/undo/:id', async (req) => {
  const { id } = req.params;
  const chore = await Chore.find({ where: { id } });
  chore.status = false;
  chore.save({ fields: ['status'] });
});

const port = Number(process.env.PORT || 5000);
app.listen(port);
