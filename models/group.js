module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define(
    'Group',
    {
      name: DataTypes.STRING,
    },
    {},
  );
  Group.associate = (models) => {
    Group.hasMany(models.Chore);
  };
  Group.prototype.rotate = async function rotate(n) {
    const chores = await this.getChores({ order: [['id', 'ASC']] });
    const newChores = chores.slice().reverse();
    for (let i = 0; i < n; i += 1) {
      const firstAssignee = newChores[0].assignee;
      newChores.forEach((chore, index) => {
        newChores[index].status = false;
        if (index === newChores.length - 1) return;
        newChores[index].assignee = newChores[index + 1].assignee;
      });
      newChores[newChores.length - 1].assignee = firstAssignee;
    }
    return Promise.all(newChores.map(chore => chore.save({ fields: ['assignee', 'status'] })));
  };

  return Group;
};
