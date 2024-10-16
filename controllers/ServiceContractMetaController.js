const db = require('../models/ApplyRelation');
const Model = db.MetaNoteModel;
const ModelImg =  db.MetaImageModel;
const { Sequelize, QueryTypes } = require('sequelize');
const { validationResult } = require('express-validator');
const { ServiceContractNoteDTO, ServiceContractImageDTO } = require ('../dtos/service_contract');
const Op = Sequelize.Op;
const path = require("path");
let formidable = require('formidable');
let fs = require('fs');

// const multer = require('multer');

async function createNote(req, res, next) {
    const { serviceContractId, notes } = req.body;
    const user = req.user;     // req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    try { 
         record = await Model.create({
                notes:notes,
                service_contract_id:serviceContractId,
                createdBy:user.ID
        });
        res.status(201).json({code: 201, status:'Successful', message: 'Record has been created successfully'});
    } catch (error) 
    {
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error', error:error});
    }
}

async function createNoteList(req, res, next) {
  var obj = req.body;
  const user = req.user;    // req.user;
  if (!obj.data) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Notes record is required" });
  }
  try { 
    let dt = JSON.parse(obj.data); 
    if (dt.length <= 0) {
        return res.status(400).json({code: 400, status: 'Validation Error', message: "Notes record is required" });
    }
    let data;
    dt.forEach(async note => {
      if ((note.notes == "" || note.notes === undefined) && (note.serviceContractId == "" || note.serviceContractId === undefined)) {
        
      }else{
        record = await Model.create({
          notes:note.notes,
          service_contract_id:note.serviceContractId,
          createdBy:user.ID
        });
      }
    });
    res.status(201).json({code: 201, status:'Successful', message: 'Record has been created successfully'});
  } catch (error) 
  {
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error', error:error});
  }
}

async function getNote(req, res){
  const { id = '', search = ''} = req.query;  //Default to page 1 and 20 records per page
  try{    
      if (id == "" ) {
          return res.status(400).json({code: 400, status: 'Validation Error', message: "Service Id is required" });
      } 
      const data = await db.sequelize.query('CALL getServiceContractNote(:service_id, :search)', {
          replacements: {
              service_id: id,
              search: search
          },
          type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
      });
      const recordList = data.map(newdata => new ServiceContractNoteDTO(newdata) );
      var totalCount = 0;
      var tableName = "Service Contract Note";
      if(data.length>0){
          totalCount = data[0].Count;
      }
      res.status(200).json({code: 200, status:'Successful', 
      message: 'Record extracted successfully',
       NumberOfRecords: totalCount, tableName:tableName, recordList: recordList,});
  } catch (error) 
  {
      res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error'  });
  }
} 

const deleteNote = async (req, res, next) => {
  const { id } = req.query;  //Get Id
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) 
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Note Nr is required" });
  try {
    const metaNote = await Model.findByPk(id);
    if (!metaNote) return res.status(404).json({code: 404, status:'Error', message: 'Note not found'  });
    metaNote.deletedBy = user.ID;
    const metaNoteData  = await metaNote.destroy();
    res.status(201).json({code: 201, status:'Successful', message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
}

async function deleteNoteList(req, res, next) {
  var obj = req.body;
  const user = req.user;
  if (!obj.data) return res.status(400).json({code: 400, status: 'Validation Error', message: "Notes Nr Array is required" });
  try { 
    let dt = JSON.parse(obj.data); 
    if (dt.length <= 0)
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Notes Nr Array is required" });
    dt.forEach(async note => {
      if (note.id == "" || note.id === undefined) { 
      }else{
        let metaNote = await Model.findByPk(note.id);
        if (metaNote) {
          metaNote.deletedBy = user.ID;
          let metaNoteData  = await metaNote.destroy();
        }
      }
    });
    res.status(201).json({code: 201, status:'Successful', message: 'Notes deleted successfully' });
  } catch (error) 
  {
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error', error:error});
  }
}

function findProjectRoot(currentPath) {
    // Check if the current path contains the project marker file
    if (fs.existsSync(path.join(currentPath, 'views'))) {
      return currentPath; // Found the project root
    }
  
    // Get the parent directory
    const parentDir = path.dirname(currentPath);
  
    // If we reach the root directory ("/" or "C:\"), stop searching
    if (currentPath === parentDir) {
      throw new Error("Project marker file 'findProjectRoot.js' not found.");
    }
  
    // Recursively search in the parent directory
        return findProjectRoot(parentDir);
}
  
async  function createImage(req,res,next){
  const user = req.user;    // req.user;
  const maxFileSizeInBytes = 10 * 1024 * 1024;
  const allowedFileExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  let form = new formidable.IncomingForm();
  form.parse(req, async function (error, fields, file) 
  {
    try {
      if (!fields.contract_id || !fields.contract_id.length > 0) {
        return res.status(400).json({code: 400, status: 'Validation Error', message: 'Service Contract Nr is Required' });
      }
      if (!fields.contract_id[0]) {
        return res.status(400).json({code: 400, status: 'Validation Error', message: 'Service Contract Nr is Required' });
      }
      
      const existingRecordCount = await ModelImg.count({
        where: {
          service_contract_id: fields.contract_id[0]
        }
      });
      if (existingRecordCount < 10) {
        if (file.images && file.images.length > 0) {
          const fileObj = file.images[0];
          const fileName = fileObj.originalFilename;
          const fileExtension = path.extname(fileName).toLowerCase();
          if (!allowedFileExtensions.includes(fileExtension)) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: 'Invalid file type. Allowed types are: ' + allowedFileExtensions.join(', ') });
          }
          const fileSizeInBytes = fileObj.size;
          if (fileSizeInBytes > maxFileSizeInBytes) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: 'File size exceeds the maximum allowed (10MB)'});
          }
          const filePathSource = fileObj.filepath;
          const filenewName = fileObj.newFilename;
          const timestamp = new Date().toISOString().replace(/[-T:]/g, '');
          const newFileName = `file_${timestamp}${fileExtension}`;
          const projectRoot = findProjectRoot(__dirname);
          const newpath = path.join(projectRoot, 'views/public/uploads', newFileName);
          const updatedURL = 'uploads/' + newFileName;
          // const inputFormat = 'jpeg';
          
          // const binaryImageData = Buffer.from(fields.base64data[0], 'base64');
          // fs.writeFile(newpath, binaryImageData, (err) => {
          //   if (err) {
          //     console.error('Error saving the Base64 data:', err);
          //   } else {
          //     console.log('Base64 data saved to:', newpath);
          //   }
          //   return res.status(500).json({code: 500, status: 'Base64', message: fields.base64data[0] });
          // });
          

          // fs.readFile(fileObj.filepath, (err, binaryData) => {
          //   console.log("Binary Data: ");
          //   console.log(binaryData);
          //   const base64Data = binaryData.toString('base64');
          //   const dataURI = `data:image/jpeg;base64,${base64Data}`;

          //   console.log("Base64: ",base64Data);
          //   console.log("data uri", dataURI);
          //   // sharp(Buffer.from(binaryData)).toFormat('jpeg')
          //   //   .toFile(newpath, (err, info) => {
          //   //     if (err) {
          //   //       console.error('Error converting data to image:', err, 'info', info);
          //   //     } else {
          //   //       console.log('Image saved:', newpath);
          //   //     }
          //   //   });
          //   fs.writeFile(newpath, dataURI, (err) => {
          //     if (err) {
          //       console.error('Error saving the Base64 data:', err);
          //     } else {
          //       console.log('Base64 data saved to:', newpath);
          //     }
          //     return res.status(500).json({code: 500, status: 'Base64', message: dataURI });
          //   });
            
          // });
          
            // fs.writeFile(newpath, binaryData, 'binary', (err) => {
            //   if (err) {
            //     console.error('Error saving the file:', err);
            //   } else {
            //     console.log('File saved successfully:', newpath);
            //   }
            // });



          fs.copyFile(filePathSource, newpath, async function (err) {
            if (err){ 
              res.status(500).json({code: 500, status:'Error', message: err });
            }else{
              var currentTitle = (fields.title && fields.title.length > 0) ? fields.title[0] : null;

              record = await ModelImg.create({
                images:updatedURL,
                title: currentTitle,
                service_contract_id:fields.contract_id[0],
                createdBy:user.ID
              });
              res.status(201).json({code: 201, status:'Success', message:'File Uploaded!'});
              res.end();
            }
          });
        }else {
          res.status(404).json({ code: 404, status: 'Error', message: 'No file found' });
        }
      }else{
        return res.status(500).json({code: 500, status: 'Limit Exceeded', message: 'Record limit exceeded for the given Contract Nr' });
      }
    } catch (error) 
    {
      console.log(error);
      res.status(500).json({code: 500, status:'Error', message: error.message, error:error});
    }
  });
}       

async function getImages(req, res){
  const { id = ''} = req.query;  //Default to page 1 and 20 records per page
  try{    
      if (id == "" ) {
          return res.status(400).json({code: 400, status: 'Validation Error', message: "Service Id is required" });
      } 
      const data = await db.sequelize.query('CALL getServiceContractImages(:service_id)', {
          replacements: {
              service_id: id
          },
          type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
      });
      const recordList = data.map(newdata => new ServiceContractImageDTO(newdata) );
      var totalCount = 0;
      var tableName = "Service Contract Images";
      if(data.length>0){
          totalCount = data[0].Count;
      }
      res.status(200).json({code: 200, status:'Successful', 
       message: 'Record extracted successfully',
       NumberOfRecords: totalCount, tableName:tableName, recordList: recordList});
  } catch (error) 
  {
      res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error'  });
  }
} 

const updateImage = async (req, res, next) => {
  const { id, title } = req.body;
  const user = req.user;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, status: 'Validation Error', message: errors.array() });
  }
  try {
      const metaImage = await ModelImg.findByPk(id);
      if (!metaImage) 
          return res.status(404).json({ code: 404, status: 'Error', message: 'Record not found' });
      if (title == "" || title === undefined) { } else { metaImage.title = title; }
      metaImage.updatedBy = user.ID;
      const metaImageData = await metaImage.save();
      res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
  } catch (error) {
      res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
  }
}

const deleteImage = async (req, res, next) => {
  const { id } = req.query;  //Get Id
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) 
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Image Nr is required" });
  try {
    const metaImage = await ModelImg.findByPk(id);
    if (!metaImage) return res.status(404).json({code: 404, status:'Error', message: 'Image not found'  });
    metaImage.deletedBy = user.ID;
    const metaImageData  = await metaImage.destroy();
    res.status(201).json({code: 201, status:'Successful', message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
  }
}

async function deleteImageList(req, res, next) {
  var obj = req.body;
  const user = req.user;
  if (!obj.data) return res.status(400).json({code: 400, status: 'Validation Error', message: "Image Nr Array is required" });
  try { 
    let dt = JSON.parse(obj.data); 
    if (dt.length <= 0)
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Image Nr Array is required" });
    dt.forEach(async image => {
      if (image.id == "" || image.id === undefined) { 
      }else{
        let metaImage = await ModelImg.findByPk(image.id);
        if (metaImage){
          metaImage.deletedBy = user.ID;
          let metaImageData  = await metaImage.destroy();
        }
      }
    });
    res.status(201).json({code: 201, status:'Successful', message: 'Images deleted successfully' });
  } catch (error) 
  {
      res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error', error:error});
  }
}


module.exports = {
   createNote, 
   getNote,
   createImage,
   getImages,
   createNoteList,
   deleteNote,
   deleteImage,
   deleteNoteList,
   deleteImageList,
   updateImage
};