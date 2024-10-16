const Model = require('../models/ApplyRelation').MachineModel;
const { Sequelize, QueryTypes } = require('sequelize');
const { MachineDTO } = require('../dtos/machinedto');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;

async function getMachines(req, res) {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;  //Default to page 1 and 20 records per page
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search != '') {
      whereCondition = {
        baugruppe: {
          [Op.like]: `${search}%`,
        },
      };
    }
    const data = await Model.findAndCountAll({
      where: whereCondition,
      offset,
      limit: parseInt(limit),
      order: [['baugruppe', 'ASC']],
    });

    const recordList = data.rows.map(newdata => new MachineDTO(newdata));
    var totalCount = 0;
    var tableName = "Baugruppe List";
    if(data.rows.length>0){
      totalCount = data.count;
    }
    res.status(200).json({
      code: 200, status: 'Successful', message: 'Record extracted successfully',
      NumberOfRecords: totalCount, PageNumber: page, tableName:tableName, records: recordList
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error' });
  }
}

const getMachineById = async (req, res, next) => {
  const { id } = req.query;
  try {
    if (id == "" || id === undefined) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Baugruppe Id is required" });
    }
    const data = await Model.findByPk(id);
    if (!data) {
      return res.status(404).json({code: 404, status:'Error', message: 'Baugruppe not found'  });
    }

    const recordList = new MachineDTO(data.dataValues);
    var tableName = data.baugruppe;
    res.status(200).json({
      code: 200, status: 'Successful', message: 'Record extracted successfully',
      tableName:tableName, records: recordList
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error' });
  }
}

const addMachines = async (req, res, next) => {
  const { bgnr, baugruppe} = req.body;
  const user = req.user;    // req.user;
  // Validate input using the imported validateRoles array
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  }
  try {
      const newObject = await Model.create({
        baugruppe: baugruppe,
        bgnr: bgnr,
        createdBy: user.ID
      });
      res.status(201).json({code: 201, status:'Successful', message: 'Baugruppe has been created successfully' });
  } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};

const updateMachines = async (req, res, next) => {
  const { id, bgnr , baugruppe } = req.body;
  const user = req.user;    // req.user;
  // Validate input using the imported validateRoles array
  if (id == "" || id === undefined) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Baugruppe Nr is required" });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  }
  try {
    const machinec = await Model.findByPk(id);
    if (!machinec) {
      return res.status(404).json({code: 404, status:'Error', message: 'Objekt not found'  });
    }
    machinec.bgnr = bgnr;
    machinec.baugruppe = baugruppe;
    machinec.updatedBy = user.ID;
    const installationdata  = await machinec.save();
    res.status(201).json({code: 201, status:'Successful', message: 'Baugruppe has been updated successfully' });
    } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};

const deleteMachines = async (req, res, next) => {
  const { id } = req.body;  //Get Id
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Baugruppe Nr is required" });
  }
  try {
    const machinec = await Model.findByPk(id);
    if (!machinec) {
      return res.status(404).json({code: 404, status:'Error', message: 'Baugruppe not found'  });
    }
    machinec.deletedBy = user.ID;
    const machinedata  = await machinec.destroy();
    res.status(201).json({code: 201, status:'Successful', message: 'Baugruppe deleted successfully' });
    } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
};


module.exports = {
   getMachines,
   getMachineById,
   addMachines,
   updateMachines,
   deleteMachines
};