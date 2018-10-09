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

exports.showNewChore = async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.find({ where: { id: groupId } });
  res.render('new-chore', { group });
};

exports.showUpdateChore = async (req, res) => {
  const { id } = req.params;
  const { groupId } = req.params;
  const chore = await Chore.find({ where: { id } });
  const group = await Group.find({ where: { id: groupId } });
  res.render('update-chore', { chore, group });
};

exports.createChore = async (req, res) => {
  const { groupId } = req.params;
  req.body.GroupId = groupId;
  try {
    const newChore = await Chore.create(req.body);
    res.redirect(`/groups/${groupId}/chores/${newChore.id}`);
  } catch (error) {
    res.redirect(`/groups/${groupId}/chores/new`);
  }
};

exports.updateChore = async (req, res) => {
  const { id } = req.params;
  const { groupId } = req.params;
  if (!('status' in req.body)) {
    req.body.status = false;
  }
  const response = await Chore.update(req.body, { where: { id } });
  const rows = JSON.parse(response);
  if (rows === 1) {
    res.status(200);
    res.redirect(`/groups/${groupId}/chores/${id}`);
  } else {
    res.status(404);
    res.redirect('/');
  }
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

exports.deleteChore = async (req, res) => {
  const { id } = req.params;
  const rows = await Chore.destroy({ where: { id } });
  if (rows === 1) {
    res.status(200).end();
  } else {
    res.status(404).end();
  }
};
