const express = require('express');
const groupController = require('../controllers/groupController');
const choreController = require('../controllers/choreController');

const router = express.Router();

// GET

router.get('/:id', groupController.showChores);

// list of chores grouped
router.get('/:groupId/chores', choreController.getChores);

// new chore page
router.get('/:groupId/chores/new', choreController.showNewChore);

// show chore
router.get('/:groupId/chores/:id', choreController.getChore);

// update chore
router.get('/:groupId/chores/:id/update', choreController.showUpdateChore);

// POST

// rotate chore assignees in group
router.post('/:id/rotate', groupController.rotateGroup);

// chore status to complete
router.post('/:groupId/chores/:id/do', choreController.doChore);

// chore status to incomplete
router.post('/:groupId/chores/:id/undo', choreController.undoChore);

// chore assignee
router.post('/:groupId/chores/:id/assign', choreController.assignChore);

// create chore
router.post('/:groupId/chores/new', choreController.createChore);

// delete chore
router.post('/:groupId/chores/:id/delete', choreController.deleteChore);

// update chore
router.post('/:groupId/chores/:id/update', choreController.updateChore);


module.exports = router;
