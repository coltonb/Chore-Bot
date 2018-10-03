module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Chores', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.BOOLEAN,
    },
    assignee: {
      type: Sequelize.STRING,
    },
    GroupId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Groups',
        key: 'id',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('Chores'),
};