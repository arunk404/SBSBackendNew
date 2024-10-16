module.exports = (sequelize, DataTypes) => {
    const UserHasInstallationModel = sequelize.define('UserHasInstallationModel', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        user_id: {type:DataTypes.INTEGER, allowNull: false, }, 
        installation_id: {type:DataTypes.INTEGER, allowNull: false, },
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
        tableName: 'user_has_installations',
        paranoid: true
    });
    return UserHasInstallationModel;
}