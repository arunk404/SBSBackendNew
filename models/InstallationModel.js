module.exports = (sequelize, DataTypes) => {
    const InstallationModel = sequelize.define('installation', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        kunden_nr: {type:DataTypes.INTEGER, allowNull: true,},
        project_nr: {type:DataTypes.STRING, allowNull: true, }, 
        kunde: {type:DataTypes.STRING, allowNull: true, }, 
        kunde_erp: {type:DataTypes.STRING, allowNull: true, }, 
        kundennummer: {type:DataTypes.STRING, allowNull: true, },
        bemerkungen: {type:DataTypes.STRING, allowNull: true, },
        contactperson: {type:DataTypes.STRING, allowNull: true, },
        address: {type:DataTypes.STRING, allowNull: true, },
        strabe: {type:DataTypes.STRING, allowNull: true, },
        plz: {type:DataTypes.STRING, allowNull: true, },
        ort: {type:DataTypes.STRING, allowNull: true, },
        tel: {type:DataTypes.STRING, allowNull: true, },
        fax: {type:DataTypes.STRING, allowNull: true, },
        email: {type:DataTypes.STRING, allowNull: true, },
        jahre: {type:DataTypes.STRING, allowNull: true, },
        
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
        tableName: 'installations',
        paranoid: true
    });
      return InstallationModel;
}