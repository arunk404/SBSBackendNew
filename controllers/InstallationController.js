// const sequelize = require('../utils/database');
const db = require("../models/ApplyRelation");
const {InstallationModel, BaugruppeServiceContractModel} = db;
const InstallationDTO = require('../dtos/installtiondto');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;


const findByKunden_nr = (knr) => {
  return InstallationModel.findOne({ where: { kunden_nr: knr } });
};

  async function getInstallations(req, res) {
      const { search = '', page = 1, limit = 50 } = req.query;  //Default to page 1 and 20 records per page
      const user = req.user;    // req.user; 
      const userRole = req.userrole;
      try {
         const offset = (page - 1) * limit;  
         let recordList=[];
         let data=[];
         var tableName = "Objekte";
         var totalCount = 0;
         if(userRole == 'external'){
          data = await db.sequelize.query('CALL getInstallationsByAssignUser(:search, :p_limit, :p_offset, :userId)', {
            replacements: {
                search: search,
                p_limit: limit,
                p_offset: offset,
                userId : user.ID,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
          });
          recordList = data.map(newdata => new InstallationDTO(newdata));
          if(data.length>0){
            totalCount = data[0].Count;
          }
         }
         else{
          let whereCondition = {};
          if (search!='') {
            whereCondition = {
              kunde: {
                [Op.like]: `%${search}%`,
              },
            };
          }
          data = await InstallationModel.findAndCountAll({
            where: whereCondition,
            offset,
            limit: parseInt(limit),
            order: [['kunde', 'ASC']],
          }); 
          recordList = data.rows.map(newdata => new InstallationDTO(newdata));
          if(data.rows.length>0){
            totalCount = data.count;
          }
        } 
         res.status(200).json({code: 200, status:'Successful', 
         message: 'Record extracted successfully' , NumberOfRecords: totalCount, 
         PageNumber: page, tableName:tableName, recordList: recordList,});
       } catch (error) 
       {
        console.log(error);
         res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error'  });
       }
  }

  

  const addInstallations = async (req, res, next) => {
    const { kundennummer = null, project_nr = null, kundenname, bemerkungen,kunden_nummer,contactperson,address, strabe, plz, ort, tel, fax, email, jhare} = req.body;
    // const user = { ID : 1 };    // req.user;
    const user = req.user;
    // Validate input using the imported validateRoles array
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {  
        const newUser = await InstallationModel.create({
          kunden_nr: kundennummer,
          project_nr: project_nr,
          kunde: kundenname,
          kunde_erp: kundenname,
          bemerkungen: bemerkungen,
          kundennummer: kunden_nummer,
          contactperson: contactperson,
          address: address,
          strabe: strabe,
          plz: plz,
          ort: ort,
          tel: tel,
          fax: fax,
          email: email,
          jhare: jhare,
          createdBy: user.ID
        });
        res.status(201).json({code: 201, status:'Successful', message: 'objekt has been created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
  };

  const updateInstallations = async (req, res, next) => {
    const { id, kunden_nr = null, project_nr ,kundenname, bemerkungen,kundennummer,contactperson,address, strabe, plz, ort, tel, fax, email, jhare} = req.body;
    const user = req.user;    // req.user;
    // Validate input using the imported validateRoles array
    if (id == "" || id === undefined) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Kunden Id is required" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {
      const installationc = await InstallationModel.findByPk(id);
      if (!installationc) {
        return res.status(404).json({code: 404, status:'Error', message: 'Kunden not found'  });
      }
      installationc.kunden_nr = kunden_nr;
      installationc.project_nr = project_nr;
      installationc.kunde = kundenname;
      installationc.kunde_erp = kundenname;
      installationc.bemerkungen = bemerkungen;
      installationc.kundennummer = kundennummer;
      installationc.contactperson = contactperson;
      installationc.address = address;
      installationc.strabe = strabe;
      installationc.plz = plz;
      installationc.ort = ort;
      installationc.tel = tel;
      installationc.fax = fax;
      installationc.email = email;
      installationc.jhare = jhare;
      installationc.updatedBy = user.ID;
      const installationdata  = await installationc.save();
      res.status(201).json({code: 201, status:'Successful', message: 'Kunden has been updated successfully' });
      } catch (error) {
      console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
  };

  const deleteInstallations = async (req, res, next) => {
    const { id } = req.query;  //Get Id
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Kunden Nr is required" });
    }
    try {
      const installationc = await InstallationModel.findByPk(id);
      if (!installationc) {
        return res.status(404).json({code: 404, status:'Error', message: 'Kunden not found'  });
      }
      installationc.deletedBy = user.ID;
      const installationdata  = await installationc.destroy();
      res.status(201).json({code: 201, status:'Successful', message: 'Kunden deleted successfully' });
      } catch (error) {
      console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
  };

module.exports = {
  getInstallations,addInstallations,updateInstallations,deleteInstallations
};
  
 