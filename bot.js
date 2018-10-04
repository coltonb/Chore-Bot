const HTTPS = require('https');
const STRINGS = require('./strings.json');
const models = require('./models');

const { Group } = models;
const { Chore } = models;

const botID = process.env.BOT_ID;

function sendMessage(msg, attach) {
  const options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST',
  };

  const body = {
    bot_id: botID,
    text: msg,
  };

  if (typeof attach !== 'undefined') {
    body.attachments = attach;
  }

  const botReq = HTTPS.request(options);
  botReq.end(JSON.stringify(body));
}

const commands = {
  chores: {
    description: STRINGS.choresDesc,
    async process() {
      let message = "This week's chores are as follows...";
      const chores = await Chore.findAll({
        order: [['GroupId', 'ASC'], ['id', 'ASC']],
        include: [Group],
      });
      let currentGroup = null;
      chores.forEach((chore) => {
        if (currentGroup !== chore.GroupId) {
          currentGroup = chore.GroupId;
          message += `\n${chore.Group.name}\n`;
        }
        message += `${chore.status ? '✔️' : '✖️'} `;
        message += `${chore.name}: `;
        message += `${chore.assignee}\n`;
      });
      sendMessage(message);
    },
  },
  rotate: {
    usage: STRINGS.rotateUsage,
    description: STRINGS.rotateDesc,
    async process(args) {
      if (args.length === 0) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const argsList = args.split(',');
      const groupName = argsList[0].trim();

      let numRotations = 1;
      if (argsList.length >= 2) {
        numRotations = parseInt(argsList[1].trim(), 10);
        numRotations = !Number.isNaN(numRotations) ? numRotations : 1;
      }

      const group = await Group.find({ where: { name: { $ilike: `%${groupName}%` } } });
      if (group === null) {
        sendMessage(STRINGS.groupNotFound);
        return;
      }

      const chores = await Chore.findAll({ order: [['id', 'ASC']], where: { GroupId: group.id } });
      if (chores.length === 0) return;

      const newChores = chores.slice().reverse();
      for (let i = 0; i < numRotations; i += 1) {
        const firstAssignee = newChores[0].assignee;
        newChores.forEach((chore, index) => {
          newChores[index].status = false;
          if (index === newChores.length - 1) return;
          newChores[index].assignee = newChores[index + 1].assignee;
        });
        newChores[newChores.length - 1].assignee = firstAssignee;
      }

      await Promise.all(newChores.map(chore => chore.save({ fields: ['assignee', 'status'] })));
      sendMessage(`Rotating ${group.name} chores ${numRotations} time(s)...\n`);
    },
  },
  do: {
    usage: STRINGS.choreUsage,
    description: STRINGS.doDesc,
    async process(args) {
      if (args.length === 0) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const argsList = args.split(',');
      const choreName = argsList[0].trim();

      let group = null;

      if (argsList.length >= 2) {
        const groupName = argsList[1].trim();
        group = await Group.find({ where: { name: { $ilike: `%${groupName}%` } } });
        if (group === null) {
          sendMessage(STRINGS.groupNotFound);
          return;
        }
      }

      let chore = null;
      if (group === null) {
        chore = await Chore.find({ where: { name: { $ilike: `%${choreName}%` } } });
      } else {
        chore = await Chore.find({
          where: { name: { $ilike: `%${choreName}%` }, GroupId: group.id },
        });
      }

      if (chore === null) {
        sendMessage(STRINGS.choreNotFound);
        return;
      }

      chore.status = true;
      chore.save({ fields: ['status'] });
      sendMessage(`'${chore.name}' marked as complete.`);
    },
  },
  undo: {
    usage: STRINGS.choreUsage,
    description: STRINGS.undoDesc,
    async process(args) {
      if (args.length === 0) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const argsList = args.split(',');
      const choreName = argsList[0].trim();

      let group = null;

      if (argsList.length >= 2) {
        const groupName = argsList[1].trim();
        group = await Group.find({ where: { name: { $ilike: `%${groupName}%` } } });
        if (group === null) {
          sendMessage(STRINGS.groupNotFound);
          return;
        }
      }

      let chore = null;
      if (group === null) {
        chore = await Chore.find({ where: { name: { $ilike: `%${choreName}%` } } });
      } else {
        chore = await Chore.find({
          where: { name: { $ilike: `%${choreName}%` }, GroupId: group.id },
        });
      }

      if (chore === null) {
        sendMessage(STRINGS.choreNotFound);
        return;
      }

      chore.status = false;
      chore.save({ fields: ['status'] });
      sendMessage(`'${chore.name}' marked as incomplete.`);
    },
  },
  addgroup: {
    usage: STRINGS.groupUsage,
    description: STRINGS.addGroupDesc,
    async process(args) {
      if (args.length === 0) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const argsList = args.split(',');
      const groupName = argsList[0].trim();

      const options = { name: groupName };
      const message = `'${groupName}' added to groups.`;
      await Group.create(options);
      sendMessage(message);
    },
  },
  removegroup: {
    usage: STRINGS.groupUsage,
    description: STRINGS.removeGroupDesc,
    async process(args) {
      if (args.length === 0) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const group = await Group.find({ where: { name: { $ilike: `%${args}%` } } });
      if (group === null) {
        sendMessage(STRINGS.groupNotFound);
        return;
      }

      const { name } = group;
      group.destroy();
      sendMessage(`'${name}' removed.`);
    },
  },
  addchore: {
    usage: STRINGS.addChoreUsage,
    description: STRINGS.addDesc,
    async process(args) {
      if (args.length < 2) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const argsList = args.split(',');
      const choreName = argsList[0].trim();
      const groupName = argsList[1].trim();

      const group = await Group.find({ where: { name: { $ilike: `%${groupName}%` } } });
      if (group === null) {
        sendMessage(STRINGS.groupNotFound);
        return;
      }

      const options = { name: choreName, GroupId: group.id };
      let message = `'${choreName}' added to ${group.name}`;
      if (argsList.length === 3) {
        const assignee = argsList[2].trim();
        options.assignee = assignee;
        message += ` and assigned to ${assignee}.`;
      } else {
        message += '.';
      }
      await Chore.create(options);
      sendMessage(message);
    },
  },
  removechore: {
    usage: STRINGS.choreUsage,
    description: STRINGS.removeDesc,
    async process(args) {
      if (args.length === 0) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const argsList = args.split(',');
      const choreName = argsList[0].trim();

      let group = null;

      if (argsList.length >= 2) {
        const groupName = argsList[1].trim();
        group = await Group.find({ where: { name: { $ilike: `%${groupName}%` } } });
        if (group === null) {
          sendMessage(STRINGS.groupNotFound);
          return;
        }
      }

      let chore = null;
      if (group === null) {
        chore = await Chore.find({ where: { name: { $ilike: `%${choreName}%` } } });
      } else {
        chore = await Chore.find({
          where: { name: { $ilike: `%${choreName}%` }, GroupId: group.id },
        });
      }

      if (chore === null) {
        sendMessage(STRINGS.choreNotFound);
        return;
      }

      const { name } = chore;
      chore.destroy();
      sendMessage(`'${name}' removed.`);
    },
  },
  assign: {
    usage: STRINGS.assignUsage,
    description: STRINGS.assignDesc,
    async process(args) {
      const argsList = args.split(',');

      if (argsList.length < 2) {
        sendMessage(STRINGS.invalidArgs);
        return;
      }

      const choreName = argsList[0].trim();
      const assignee = argsList[1].trim();
      let group = null;

      if (argsList.length >= 3) {
        const groupName = argsList[1].trim();
        group = await Group.find({ where: { name: { $ilike: `%${groupName}%` } } });
        if (group === null) {
          sendMessage(STRINGS.groupNotFound);
          return;
        }
      }

      let chore = null;
      if (group === null) {
        chore = await Chore.find({ where: { name: { $ilike: `%${choreName}%` } } });
      } else {
        chore = await Chore.find({
          where: { name: { $ilike: `%${choreName}%` }, GroupId: group.id },
        });
      }

      if (chore === null) {
        sendMessage(STRINGS.choreNotFound);
        return;
      }

      chore.assignee = assignee;
      await chore.save({ fields: ['assignee'] });
      sendMessage(`'${chore.name}' assigned to ${assignee}.`);
    },
  },
  list: {
    description: STRINGS.listDesc,
    process() {
      const commandList = Object.keys(commands).sort();
      let message = '';
      commandList.forEach((cmd) => {
        message += `*/${cmd}`;
        if ('usage' in commands) message += ` ${commands[cmd].usage}`;
        message += '\n';
      });
      sendMessage(message);
    },
  },
  help: {
    usage: STRINGS.helpUsage,
    description: STRINGS.helpDesc,
    process(args) {
      let cmd = args.split(' ')[0].toLowerCase();
      if (cmd.length === 0) cmd = 'help';
      if (!(cmd in commands)) {
        sendMessage(STRINGS.commandNotFound);
        return;
      }
      let message = `*/${cmd}`;
      if ('usage' in commands[cmd]) message += ` ${commands[cmd].usage}`;
      message += `\n-${commands[cmd].description}`;
      sendMessage(message);
    },
  },
};

function respond() {
  const request = JSON.parse(this.req.chunks[0]);

  if (request.text != null) {
    const message = request.text;

    if (message.charAt(0) === '/') {
      const cmd = message.split(' ')[0].substring(1);
      const args = message.substring(cmd.length + 2).trim();
      if (cmd in commands) {
        commands[cmd].process(args);
      }
    } else {
      this.res.writeHead(200);
      this.res.end();
    }
  }
}

exports.respond = respond;
