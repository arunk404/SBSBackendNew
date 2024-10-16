const Model = require('../models/ApplyRelation').ElementModel;
const { ElementDTO } = require('../dtos/element.dto');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;
require('dotenv').config();
const SMB2 = require('smb2');

  const accessDirectory = async (req, res, next) => {
    console.log(process.env.SHARED_STORAGE_URL);
    // const smb2Client = new SMB2({
    //   share: process.env.SHARED_STORAGE_URL,
    //   domain: process.env.SHARED_STORAGE_DOMAIN || '',
    //   username: process.env.SHARED_STORAGE_USERNAME,
    //   password: process.env.SHARED_STORAGE_PASSWORD
    // });

      const smb2Client = new SMB2({
        share:'\\\\192.168.15.100\\c$'
        , domain:'.'
        , username:'ehtisham-mentor\ehtisham'
        , password:'mentorox.124'
      });
      console.clear();
      console.log(smb2Client);
    
      // smb2Client.readdir('Windows\\System32', (err, files) => {
      //   if (err) {
      //     console.error('Unable to list files:', err);
      //   } else {
      //     console.log('Files:', files);
      //   }
      // });
  };


module.exports = {
    accessDirectory
};
  
//