module.exports = (sequelize, DataTypes) => {
  const Chore = sequelize.define(
    'Chore',
    {
      name: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      assignee: DataTypes.STRING,
    },
    {},
  );
  return Chore;
};
