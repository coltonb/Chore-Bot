const models = require('../models');

const { Group } = models;

exports.rotateGroup = async (req, res) => {
  const { id } = req.params;
  const group = await Group.find({ where: { id } });
  if (group === null) {
    res.status(404);
    res.redirect('/');
    return;
  }
  try {
    await group.rotate(1);
    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
};

exports.showChores = async (req, res) => {
  const { id } = req.params;
  const group = await Group.find({ where: { id } });
  if (group === null) {
    res.status(404);
    res.redirect('/');
    return;
  }
  const chores = await group.getChores({ order: [['id', 'ASC']] });
  res.render('group', { group, chores });
};

exports.showGroups = async (req, res) => {
  const groups = await Group.findAll();
  res.render('show-groups', { groups });
};
