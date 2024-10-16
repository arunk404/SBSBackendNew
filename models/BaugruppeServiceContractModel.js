module.exports = (sequelize, DataTypes) => {
    const BaugruppeServiceContractModel = sequelize.define('BaugruppeServiceContract', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        baugruppe_installation_id: {type:DataTypes.INTEGER},
        service_contract_id: {type:DataTypes.INTEGER},
        bemerkungen:{type:DataTypes.STRING},
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
        tableName: 'baugruppe_service_contracts',
        paranoid: true
    });
      return BaugruppeServiceContractModel;
}