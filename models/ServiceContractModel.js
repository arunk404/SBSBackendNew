module.exports = (sequelize, DataTypes) => {
    const ServiceContractModel = sequelize.define('service_contracts', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      installation_id: {
        type: DataTypes.BIGINT,
      },
      contract_id: {
        type: DataTypes.STRING,
      },
      bemerkungen: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wartungsdatum:{
        type: DataTypes.DATE,
        allowNull: true,
       },
       name_sachkundiger:{
        type: DataTypes.STRING,
        allowNull: true,
       },
       userId:{
        type: DataTypes.BIGINT,
       },
       createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deletedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
      tableName: 'service_contracts', // Specify the custom table name
    });
    return ServiceContractModel;
 }
 
 