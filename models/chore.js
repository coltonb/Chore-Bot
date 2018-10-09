module.exports = (sequelize, DataTypes) => {
  const Chore = sequelize.define(
    'Chore',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      assignee: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {},
  );
  Chore.associate = (models) => {
    Chore.belongsTo(models.Group);
  };
  return Chore;
};
