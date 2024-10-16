module.exports = (sequelize, DataTypes) => {
    const DispatchEmailModel = sequelize.define('Dispatch_Email', {
      id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
      report_id: {type:DataTypes.INTEGER},
      email:{type:DataTypes.STRING},
      subject:{type:DataTypes.STRING},
      message:{type:DataTypes.STRING},
      email_status: {type:DataTypes.INTEGER},
      status_message:{type:DataTypes.STRING},
      file_url:{type:DataTypes.STRING},
      createdBy: { type: DataTypes.STRING, allowNull: true, },
      updatedBy: { type: DataTypes.STRING, allowNull: true, },
      deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
      tableName: 'dispatch_reports',
      paranoid: true
    });
      return DispatchEmailModel;
  }