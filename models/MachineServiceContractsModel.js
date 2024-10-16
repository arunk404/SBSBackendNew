module.exports = (sequelize, DataTypes) => {
    const MachineServiceContractsModel = sequelize.define('MachineServiceContractsModel', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
       
        bemerkungen: {type:DataTypes.STRING, allowNull: true, },
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    
    },{
        tableName: 'baugruppe_service_contracts',
        paranoid: true
    });
      return MachineServiceContractsModel;
}