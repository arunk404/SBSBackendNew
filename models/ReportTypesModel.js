module.exports = (sequelize, DataTypes) => {
    const ReportTypesModel = sequelize.define('Reporttypes', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        title:{type:DataTypes.STRING},
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
        tableName: 'report_types',
        paranoid: true
    });
      return ReportTypesModel;
}