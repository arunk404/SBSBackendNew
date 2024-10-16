module.exports = (sequelize, DataTypes) => {
    const MetaNoteModel = sequelize.define('MetaNoteModel', {
      id: {type: DataTypes.BIGINT, autoIncrement: true, allowNull: false, primaryKey: true},
      notes:{type:DataTypes.STRING,allowNull:false},
      service_contract_id:{type:DataTypes.BIGINT,allowNull:false},
      createdBy: { type: DataTypes.STRING, allowNull: true, },
      updatedBy: { type: DataTypes.STRING, allowNull: true, },
      deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
      tableName: 'service_contract_notes',
      paranoid: true
    });
      return MetaNoteModel;
  }