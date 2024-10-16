const Model = require('../models/ApplyRelation').ElementModel;
const db = require("../models/ApplyRelation");
const { ElementDTO } = require('../dtos/element.dto');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;
const {DispatchEmailModel} = db;
const path = require("path");
let formidable = require('formidable');
const fileService = require('../services/image');
const emailService = require('../services/email');
const { userCreationValidate } = require('../validation/Validator');


  async function sendemail(req,res,next){
    const user = req.user;    // req.user;
    let form = new formidable.IncomingForm();
    form.parse(req, async function (error, fields, file) 
    {
      try {
        var id = fields.id && fields.id.length > 0 ? fields.id[0] : null;
        var email1 = fields.email1 && fields.email1.length > 0 ? fields.email1[0] : '';
        var email2 = fields.email2 && fields.email2.length > 0 ? fields.email2[0] : '';
        var email3 = fields.email3 && fields.email3.length > 0 ? fields.email3[0] : '';
        var subject = fields.subject && fields.subject.length > 0 ? fields.subject[0] : '';
        var message = fields.message && fields.message.length > 0 ? fields.message[0] : '';
        

        if (email1 =='') {
          return res.status(400).json({code: 400, status: 'Validation Error', message: 'Email is Required' });
        }
        if (subject =='') {
          return res.status(400).json({code: 400, status: 'Validation Error', message: 'subject is Required' });
        }
        var updatedURL = null ;
        var fileName = null;
        if (file.file && file.file.length > 0) {
          fileName = file.file[0].originalFilename;
          getpath = fileService.saveFile(file.file[0],2);
          if(getpath.code != 201){
              return res.status(getpath.code).json({code: getpath.code, status: getpath.status, message: getpath.message });
          }else{
              updatedURL = getpath.message;
          }
        }
        
        var to = email1;
        if (email2 != "" ) {
            to = to+","+email2;
        }
        if (email3 != "" ) {
            to = to+","+email3;
        }
        var getEmailStatus =  await emailService.sent_Email(to,subject,message,fileName,updatedURL);
        var m_status = 1;
        if(getEmailStatus.code != 200){
          res.status(201).json({code: 400, status:'Error', message:'Eroor sending Email'});
          m_status = 0;
        }
        const newObject = await DispatchEmailModel.create({
            report_id : id,
            email: to,
            subject: subject,
            message: message,
            email_status: m_status,
            file_url : updatedURL,
            status_message : JSON.stringify(getEmailStatus.message),
            createdBy: user.ID

        });

        res.status(201).json({code: 201, status:'Success', message:'Email has sent !'});
      } catch (error) 
      {
        console.log(error);
        res.status(500).json({code: 500, status:'Error', message: error.message, error:error});
      }
      
    });
  }
  const get_email_log_status = async (req,res,next)=> {

    const { id = ''} = req.query;
    
	
	try{

	
	if(id == ''){
        return res.status(400).json({code:400 , status_message:'Validation Error',message :'Report Id is required'});

      }
      const data = await db.sequelize.query('CALL getLogEmailModal(:id)', {
        replacements : {
          id : id,
        },
        type: Sequelize.QueryTypes.RAW,
      });
	  
        if(data.length>0){
          return res.status(200).json({code:200, status:'success', report_id:'true', message:'report has not been sent'})
        }
        else{
          return res.status(200).json({code:200, status:'error', report_id:'false', message:'report has been sent'})
        }  
	 
    }
    catch(error){
      
      res.status(500).json({code:500, status:'Error', message:'Internal server Eror'})
    }
  }  

module.exports = {
  sendemail,
  get_email_log_status
};
  