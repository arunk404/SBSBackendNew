
const DataTypes = require('sequelize');
const sequelize = require('../utils/database');


const db = {};

db.DataTypes = DataTypes;
db.sequelize = sequelize;
//
db.UserModel = require("./UserModel")(sequelize, DataTypes);
db.RoleModel = require("./RoleModel")(sequelize, DataTypes);
db.InstallationModel = require("./InstallationModel")(sequelize, DataTypes);
db.ServiceContractModel = require("./ServiceContractModel")(sequelize, DataTypes);
db.MachineModel = require("./MachineModel")(sequelize,DataTypes);
db.MachineInstallationsModel = require("./MachineInstallationsModel")(sequelize,DataTypes);
db.ElementModel = require("./ElementModel")(sequelize,DataTypes);
db.MachineELementModel = require("./MachineElementModel")(sequelize,DataTypes);
db.MetaNoteModel = require('./ServiceContractNoteModel')(sequelize,DataTypes);
db.BaugruppeTemplateModel = require('./BaugruppeTemplateModel')(sequelize,DataTypes);
db.MetaImageModel = require('./ServiceContractImageModel')(sequelize,DataTypes);
db.ReportTypesModel = require('./ReportTypesModel')(sequelize,DataTypes);
db.ReportsModel = require('./ReportsModel')(sequelize,DataTypes);
db.UserHasInstallationModel = require('./UserHasInstallationModel')(sequelize,DataTypes);
db.DispatchEmailModel = require('./DispatchEmailModel')(sequelize,DataTypes);
db.BaugruppeServiceContractModel = require('./BaugruppeServiceContractModel')(sequelize,DataTypes);

db.RoleModel.belongsToMany(db.UserModel, {
	foreignKey: 'roleId',
    through: 'USER'
});
db.UserModel.belongsTo(db.RoleModel, {
    foreignKey: 'roleId',
    through: 'USER'
});

db.InstallationModel.hasMany(db.ServiceContractModel, {
	foreignKey: 'installation_id'
});

db.InstallationModel.hasMany(db.MachineInstallationsModel, {
	foreignKey: 'installation_id'
});

db.MachineModel.hasMany(db.MachineInstallationsModel, {
	foreignKey: 'baugruppe_id'
});

module.exports = db;