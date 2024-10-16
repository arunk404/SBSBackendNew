const Model = require('../models/ApplyRelation').ElementModel;
const { ElementDTO } = require('../dtos/element.dto');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;

  async function getElements(req, res) {
      const { search = '', page = 1, limit = 50 } = req.query;  //Default to page 1 and 20 records per page
       try {
         const offset = (page - 1) * limit;  
         let whereCondition = {};
         if (search!='') {
           whereCondition = {
            bauelement: {
               [Op.like]: `${search}%`,
             },
           };
         }
         const data = await Model.findAndCountAll({
           where: whereCondition,
           offset,
           limit: parseInt(limit),
           order: [['bauelement', 'ASC']],
         }); 
         const recordList = data.rows.map(newdata => new ElementDTO(newdata));
         
         var tableName = "Bauelement List";
         var totalCount = 0;
         if(data.rows.length>0){
           totalCount = data.count;
         }
         
         res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully' ,
          NumberOfRecords: totalCount, PageNumber: page, tableName:tableName, recordList: recordList,});
       } catch (error) 
       {
        console.log(error);
         res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error'  });
       }
  }

  async function getAllElements(req, res) {
    const { search = '' } = req.query;  //Default to page 1 and 20 records per page
     try {
       let whereCondition = {};
       if (search!='') {
         whereCondition = {
          bauelement: {
            [Op.and]: [
              { [Op.like]: `${search}%` },
              { [Op.not]: null },
            ],
           },
         };
       }else{
        whereCondition = {
          bauelement: {
            [Op.not]: null 
          },  
         };
       }
       const data = await Model.findAll({
         where: whereCondition,
         order: [['bauelement', 'ASC']],
       }); 
       const recordList = data.map(newdata => new ElementDTO(newdata));
       
       var tableName = "Bauelement List";
       var totalCount = 0;
       if(data.length>0){
         totalCount = data.length;
       }
       
       res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully' ,
        NumberOfRecords: totalCount, tableName:tableName, recordList: recordList,});
     } catch (error) 
     {
      console.log(error);
       res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error'  });
     }
}

  const addElement = async (req, res, next) => {
    const { bauelement} = req.body;
    const user = req.user;    // req.user;
    // Validate input using the imported validateRoles array
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    
    try {
        const newObject = await Model.create({
          bauelement: bauelement,
          createdBy: user.ID
        });
        res.status(201).json({code: 201, status:'Successful', message: 'Bauelement has been created successfully' });
    } catch (error) {
      console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
  };
  
  const updateElement = async (req, res, next) => {
    const { id, bauelement} = req.body;
    const user = req.user;    // req.user;
    // Validate input using the imported validateRoles array
    if (id == "" || id === undefined) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Bauelement Nr is required" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {
      const elementc = await Model.findByPk(id);
      if (!elementc) {
        return res.status(404).json({code: 404, status:'Error', message: 'Bauelement not found'  });
      }
      elementc.bauelement = bauelement;
      elementc.updatedBy = user.ID;
      const elementdata  = await elementc.save();
      res.status(201).json({code: 201, status:'Successful', message: 'Bauelement has been updated successfully' });
      } catch (error) {
      console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
  };
  
  const deleteElement = async (req, res, next) => {
    const { id } = req.body;  //Get Id
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Bauelement Nr is required" });
    }
    try {
      const elementc = await Model.findByPk(id);
      if (!elementc) {
        return res.status(404).json({code: 404, status:'Error', message: 'Bauelement not found'  });
      }
      elementc.deletedBy = user.ID;
      const elementdata  = await elementc.destroy();
      res.status(201).json({code: 201, status:'Successful', message: 'Bauelement deleted successfully' });
      } catch (error) {
      console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
  };


module.exports = {
    getElements,getAllElements,addElement,updateElement,deleteElement
};
  
//