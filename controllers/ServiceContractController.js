const db = require("../models/ApplyRelation");
const {InstallationModel,ServiceContractModel} = db;
const { ServiceContractDTO } = require ('../dtos/service_contract');
const { validationResult } = require('express-validator');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

async function getServiceContracts(req, res){
  const { id = ''} = req.query;  //Get Id
    try{
      if (id == "") {
        return res.status(400).json({code: 400, status: 'Validation Error', message: "Kunden Nr is required" });
      }
      const data = await db.sequelize.query('CALL getServiceContracts(:installationid)', {
          replacements: {
              installationid: id
          },
          type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
      });
      var totalCount = 0;
      var tableName = "";
      var recordList = [];
      var kunden = [];
      if(data.length>0){
        if(data[0].current_condition == 0){
          recordList = data.map(newdata => new ServiceContractDTO(newdata) );
          totalCount = data[0].Count;
        }
        tableName = "Wartungsaufträge für " + data[0].kunde;
        kunden = {
          id : data[0].kunden_id,
          project_nr: data[0].project_nr,
          kunde: data[0].kunde,
          kundennummer: data[0].kundennummer,
          contactperson: data[0].contactperson,
          address: data[0].address,
          email: data[0].email,
          tel: data[0].tel,
          bemerkungen: data[0].kunden_bemerkungen,
        }
      }
      res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
      NumberOfRecords: totalCount, tableName: tableName,kunden: kunden, recordList:recordList});
    } catch (error) 
    {
      // console.log(error);
      res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error'  });
    }
}

const findReportByTypeAndContractId = async (reportType, contractId) => {
  try {
    const report = await db.ReportsModel.findOne({
        where: {
          report_type_id: reportType,
          service_contract_id: contractId
        
        }
    });
    if (report) {
      return report.toJSON();
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error to handle it further if needed
  }
};


const addServiceContracts = async (req, res, next) => {
  const { installation_id, contract_id, bezeichnung = null, wartungsdatum, name_sachkundiger = null} = req.body;
  const user = { ID : 1 };    // req.user;
  // Validate input using the imported validateRoles array
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  }
  try {
      const serviceContract = await ServiceContractModel.findOne({
        where: {
          contract_id: contract_id
        }
      });
      if (serviceContract) 
        return res.status(400).json({code: 400, status:'Error', message: 'Contract number is already exist'  });
      
      let wartungs_datum=null;
      if (wartungsdatum.includes('.')) {
        let [day, month, year] = wartungsdatum.split('.');
        wartungs_datum = new Date(`${year}-${month}-${day}`);
      }else{
        wartungs_datum = wartungsdatum; 
      }
      const newObject = await db.sequelize.query('CALL addServiceContractV2(:customerid, :contractid, :note, :sdate, :ano_note, :empId, :userId)', {
          replacements: {
              customerid: installation_id,
              contractid: contract_id,
              note: bezeichnung,
              sdate: wartungs_datum,
              ano_note: null,
              empId: name_sachkundiger,
              userId: user.ID
          },
          type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
      });
      res.status(201).json({code: 201, status:'Successful', message: 'Service Contracts has been created successfully' });
  } catch (error) {
    // console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};



const updateServiceContracts = async (req, res, next) => {
  const { id, installation_id = '', contract_id = '', bezeichnung = '', wartungsdatum = '', name_sachkundiger = 0} = req.body;
  const user = { ID : 1 };    // req.user;
  // Validate input using the imported validateRoles array
  if (id == "" || id === undefined) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Service Contract Nr is required" });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  }
  try {
    const serviceContract = await ServiceContractModel.findByPk(id);
    if (!serviceContract) {
      return res.status(404).json({code: 404, status:'Error', message: 'Objekt not found'  });
    }
    if(installation_id != ""){ serviceContract.installation_id = installation_id; }
    if(contract_id != ""){ serviceContract.contract_id = contract_id; }
    if(bezeichnung != ""){ serviceContract.bemerkungen = bezeichnung; }
    if(wartungsdatum != ""){ 
      if (wartungsdatum.includes('.')) {
        let [day, month, year] = wartungsdatum.split('.');
        let war_date = new Date(`${year}-${month}-${day}`);
        serviceContract.wartungsdatum = war_date; 
      }else{
        serviceContract.wartungsdatum = wartungsdatum; 
      }
    }
    // if(name_sachkundiger != ""){ serviceContract.name_sachkundiger = name_sachkundiger; }
    if(name_sachkundiger != 0){ serviceContract.userId = name_sachkundiger; }
    
    serviceContract.updatedBy = user.ID;
    const serviceContractdata  = await serviceContract.save();
    res.status(201).json({code: 201, status:'Successful', message: 'Service Contract has been updated successfully' });
    } catch (error) {
    // console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};

const deleteServiceContracts = async (req, res, next) => {
  const { id } = req.query;  //Get Id
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Service Contract Nr is required" });
  }
  try {
    const serviceContract = await ServiceContractModel.findByPk(id);
    if (!serviceContract) {
      return res.status(404).json({code: 404, status:'Error', message: 'Service Contract not found'  });
    }
    serviceContract.deletedBy = user.ID;
    const serviceContractdata  = await serviceContract.destroy();
    res.status(201).json({code: 201, status:'Successful', message: 'Service Contract deleted successfully' });
    } catch (error) {
    // console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};

module.exports = {
    getServiceContracts,addServiceContracts,updateServiceContracts,deleteServiceContracts
};
  
 