module.exports = (sequelize, DataTypes) => {
    const ReportsModel = sequelize.define('Reports', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        service_contract_id: {type: DataTypes.INTEGER, allowNull: false},
        report_type_id: {type: DataTypes.INTEGER, allowNull: false },
        datum: {type: DataTypes.DATE, },
        name_sachkundiger:{type:DataTypes.STRING, allowNull: true, },
        signation: {type:DataTypes.STRING, allowNull: true, },
        employee_signature: {type:DataTypes.STRING, allowNull: true, },
        numberofrecords: {type: DataTypes.INTEGER, allowNull: true },
        reportheader: {type:DataTypes.STRING, allowNull: true, }, 
        report: {type:DataTypes.TEXT, allowNull: true, },
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
        tableName: 'reports',
        paranoid: true
    });
      return ReportsModel;
}