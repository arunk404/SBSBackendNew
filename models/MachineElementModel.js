module.exports = (sequelize, DataTypes) => {
    const MachineELementModel = sequelize.define('MachineELement', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        baugrupe_inst_id: {type:DataTypes.INTEGER},
        sort_by:{type:DataTypes.INTEGER},
        service_contract_id: {type:DataTypes.INTEGER},
        bauelement_id:{type:DataTypes.INTEGER},
        bemerkung: {type:DataTypes.STRING},
        tatigkeit: {type:DataTypes.STRING},
        interne_bemerkungen: {type:DataTypes.STRING},
        prev_bemerkung_val: {type:DataTypes.STRING},
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
        tableName: 'baugruppe_bauelement',
        paranoid: true
    });
      return MachineELementModel;
}
