module.exports = (sequelize, Sequelize) => {
    const RoleModel = sequelize.define("roles", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  
    return RoleModel;
  };