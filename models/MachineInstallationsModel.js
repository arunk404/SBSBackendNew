
module.exports = (sequelize, DataTypes) => {
    const MachineInstallationsModel = sequelize.define('MachineInstallations', {
      id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
      baugruppe_id:{type:DataTypes.INTEGER, foreignKey:true},
      installation_id:{type: DataTypes.INTEGER, foreignKey:true},
      baugruppe_template_id:{type:DataTypes.INTEGER},
      hinweis_letzte_sv:{type:DataTypes.STRING},
      hinweis_letzte_sv1:{type:DataTypes.STRING}
    },{
      tableName: 'baugruppe_installations',
      paranoid: true
    });
      return MachineInstallationsModel;
}