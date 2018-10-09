const models = require('../models');

const { Chore } = models;
const { Group } = models;

exports.getChore = async (req, res) => {
  const { id } = req.params;
  const { groupId } = req.params;
  const chore = await Chore.find({ where: { id } });

  if (chore === null) {
    res.status(404);
    res.redirect('/');
    return;
  }

  const group = await Group.find({ where: { id: groupId } });

  if (group === null) {
    res.status(404);
    res.redirect('/');
    return;
  }

  res.render('show-chore', { chore, group });
};

exports.getChores = async (req, res) => {
  const groups = await Group.findAll({ order: [['id', 'ASC']] });
  const chores = await Chore.findAll({ order: [['id', 'ASC']] });
  res.render('index', { groups, chores });
};

exports.newChore = async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.find({ where: { id: groupId } });
  res.render('new-chore', { group });
};

exports.createChore = async (req, res) => {
  const { groupId } = req.params;
  try {
    await Chore.create(req.body);
    res.status(200).end();
  } catch (error) {
    res.status(409).end();
  }
  res.redirect(`/groups/${groupId}`);
};

exports.doChore = async (req, res) => {
  const { id } = req.params;
  const response = await Chore.update({ status: true }, { where: { id } });
  const rows = JSON.parse(response);
  if (rows === 1) {
    res.status(200).end();
  } else {
    res.status(404);
    res.redirect('/');
  }
};

exports.undoChore = async (req, res) => {
  const { id } = req.params;
  const response = await Chore.update({ status: false }, { where: { id } });
  const rows = JSON.parse(response);
  if (rows === 1) {
    res.status(200).end();
  } else {
    res.status(404);
    res.redirect('/');
  }
};

exports.assignChore = async (req, res) => {
  const { id } = req.params;
  const { assignee } = req.body;
  const response = await Chore.update({ assignee }, { where: { id } });
  const rows = JSON.parse(response);
  if (rows === 1) {
    res.status(200).end();
  } else {
    res.status(404);
    res.redirect('/');
  }
};
