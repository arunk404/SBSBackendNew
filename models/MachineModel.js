module.exports = (sequelize, DataTypes) => {
  const MachineModel = sequelize.define('Machine', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    bgnr: {type:DataTypes.INTEGER},
    baugruppe:{type:DataTypes.STRING},
    createdBy: { type: DataTypes.STRING, allowNull: true, },
    updatedBy: { type: DataTypes.STRING, allowNull: true, },
    deletedBy: { type: DataTypes.STRING, allowNull: true, },
  },{
    tableName: 'baugruppe',
    paranoid: true
  });
    return MachineModel;
}