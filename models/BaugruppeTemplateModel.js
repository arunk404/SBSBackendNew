module.exports = (sequelize, DataTypes) => {
    const MachineTemplateModel = sequelize.define('MachineTemplate', {
      id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
      bgnr: {type:DataTypes.INTEGER},
      baugruppe:{type:DataTypes.STRING},
      createdBy: { type: DataTypes.STRING, allowNull: true, },
      updatedBy: { type: DataTypes.STRING, allowNull: true, },
      deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
      tableName: 'baugruppe_template_tbl',
      paranoid: true
    });
      return MachineTemplateModel;
  }