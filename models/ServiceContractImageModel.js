module.exports = (sequelize, DataTypes) => {
    const MetaImagesModel = sequelize.define('MetaNoteModel', {
      id: {type: DataTypes.BIGINT, autoIncrement: true, allowNull: false, primaryKey: true},
      title:{type:DataTypes.STRING,allowNull:true},
      images:{type:DataTypes.STRING,allowNull:false},
      service_contract_id:{type:DataTypes.BIGINT,allowNull:false},
      createdBy: { type: DataTypes.STRING, allowNull: true, },
      updatedBy: { type: DataTypes.STRING, allowNull: true, },
      deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
      tableName: 'service_contract_images',
      paranoid: true
    });
      return MetaImagesModel;
} 