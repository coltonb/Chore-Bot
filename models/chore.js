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
  Chore.associate = (models) => {
    Chore.belongsTo(models.Group);
  };
  return Chore;
};
