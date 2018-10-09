const models = require('../models');
const bot = require('../bot');

const { Chore } = models;
const { Group } = models;

exports.get = async (req, res) => {
  const groups = await Group.findAll({ order: [['id', 'ASC']] });
  const chores = await Chore.findAll({ order: [['id', 'ASC']] });
  res.render('index', { groups, chores });
};

exports.post = (req) => {
  bot.respond(req.body);
};
