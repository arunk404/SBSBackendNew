const db = require("../models/ApplyRelation");
const {DispatchEmailModel, UserModel} = db;
const { ChecklistRecords, ChecklistHeader, getAllReportsList } = require('../dtos/record.dto');
const { MachineInstallationDTO } = require('../dtos/machinedto');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { validationResult } = require('express-validator');
const imageService = require('../services/image');
let formidable = require('formidable');
const email = require('../services/email');


async function getReport(req, res){

    const { id = '', report_type_id = ''} = req.query;  //Get Id
      try{
        if (id == "") {
          return res.status(400).json({code: 400, status: 'Validation Error', message: "Service Constract is required" });
        }
        if(report_type_id == ""){
            return res.status(400).json({code: 400, status: 'Validation Error', message: "Report Type is required" });
        }

        var totalCount = 0;
        var tableName = "";
        var recordList = [];
        var recordListHeader = {};
        var arraylist = [];
        var submittedrecord = {};
        if(report_type_id == 1 || report_type_id == 3){
            var sp = "";
            if(report_type_id == 1){
                sp = "getReportDataOfServiceContract";
            }else{
                sp = "getReportDataOfServiceContractV2";
            }
            const data = await db.sequelize.query('CALL '+sp+'(:s_id)', {
                replacements: {
                    s_id: id
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            var obj = [];
            var i = -1 ;
            var j = 0;
            if(data.length>0){
                totalCount = data[0].Count;
                tableName = "Checklist Report";
                recordListHeader = new ChecklistHeader(data[0]);
                recordList = data.map(newdata => new ChecklistRecords(newdata));
                
                submittedrecord = {
                    name_sachkundiger: data[0].employeename,
                };
                var baugid = 0;
                var matchingkey;
                for (const key in recordList) {
                    baugid = recordList[key].baugruppe_id;
                    if(matchingkey == baugid){
                        j++;
                        var newRecord = {
                            be_nr: recordList[key].be_nr,
                            bauelement: recordList[key].bauelement,
                            tatigkeit: recordList[key].tatigkeit,
                            bemerkung: recordList[key].bemerkung,
                        };
                        arraylist[i].record.push(newRecord);
                    }else{
                        j = 0;
                        i++;
                        matchingkey = recordList[key].baugruppe_id;
                        arraylist[i] = {
                            baugruppe_id: recordList[key].baugruppe_id,
                            bgnr: recordList[key].bgnr,
                            baugruppe: recordList[key].baugruppe,
                            hinweis_letzte_sv: recordList[key].hinweis_letzte_sv,
                            progress: recordList[key].progress,
                            record: [{
                                be_nr: recordList[key].be_nr,
                                bauelement: recordList[key].bauelement,
                                tatigkeit: recordList[key].tatigkeit,
                                bemerkung: recordList[key].bemerkung,
                            }],
                            baugruppe_nr: recordList[key].baugruppe_nr,
                        };
                    }
                }
                res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
                    NumberOfRecords: totalCount, tableName: tableName, recordListHeader: recordListHeader,  recordList: arraylist, submittedrecord: submittedrecord,});
            }else{
                res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
                    NumberOfRecords: totalCount, tableName: tableName, recordListHeader: recordListHeader,  recordList: recordList, submittedrecord: submittedrecord,});
            }
        }
        else if(report_type_id == 2){
            const data = await db.sequelize.query('CALL getServiceContractById(:s_id)', {
                replacements: {
                    s_id: id
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            if(data.length>0){
                tableName = "Service Contract Info";
                recordListHeader = new ChecklistHeader(data[0]);
                submittedrecord = {
                    name_sachkundiger: data[0].employeename,
                };
            }
            const data1 = await db.sequelize.query('CALL getInstallationsBaugruppeAgainstServiceContract(:s_id)', {
                replacements: {
                    s_id: id
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            
            if(data1.length>0){
                tableName = "Anlagen Report List";
                totalCount = data1.length;
            }
            arraylist = data1.map(newdata => new MachineInstallationDTO(newdata));
            
            res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
            NumberOfRecords: totalCount,tableName: tableName, recordListHeader: recordListHeader,  recordList: arraylist, submittedrecord: submittedrecord});
        }else if(report_type_id == 4){
            const data = await db.sequelize.query('CALL getServiceContractById(:s_id)', {
                replacements: {
                    s_id: id
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            if(data.length>0){
                tableName = "Service Contract Info";
                recordListHeader = new ChecklistHeader(data[0]);
                submittedrecord = {
                    name_sachkundiger: data[0].employeename,
                };
                res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
                    tableName: tableName, recordListHeader: recordListHeader,submittedrecord: submittedrecord,});
            }
        }
        else{
            res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
                    NumberOfRecords: totalCount, tableName: tableName, recordListHeader: '',  recordList: '', submittedrecord: '',});
        }
      } catch (error) 
      {
        // console.log(error);
        res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error'  });
      }
}

async function getAllReports(req, res){
    const { id = ''} = req.query;  //Get Id
      try{
        if (id == "") {
          return res.status(400).json({code: 400, status: 'Validation Error', message: "Service Contract Nr is required" });
        }
        const data = await db.sequelize.query('CALL getReports(:s_id)', {
            replacements: {
                s_id: id
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        
        var totalCount = 0;
        var tableName = "All Reports";
        var recordList = [];
        if(data.length>0){
          recordList = data.map(newdata => new getAllReportsList(newdata) );
          totalCount = data[0].Count;
        }
        res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
        NumberOfRecords: totalCount, tableName: tableName,  recordList: recordList,});
      } catch (error) 
      {
        // console.log(error);
        res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error'  });
      }
} 


async  function addReport(req,res,next){
    const user = req.user;    // req.user;
    var clientupdatedURL = '';
    var employeeupdatedURL = '';
    var getimgpath;
    let form = new formidable.IncomingForm();
    form.parse(req, async function (error, fields, file) 
    {
      try {
        if (!fields.id || !fields.id.length > 0) {
          return res.status(400).json({code: 400, status: 'Validation Error', message: 'Service Contract Nr is Required' });
        }
        if (fields.id[0]=="") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Service Contract Nr is Required' });
        }
        if (!fields.report_type_id || !fields.report_type_id[0]) {
          return res.status(400).json({code: 400, status: 'Validation Error', message: 'Report Type Id is Required' });
        }
        if (fields.report_type_id[0]=="") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Report Type Id is Required' });
        }

        if (!fields.datum || !fields.datum[0]) {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Datum is Required' });
        }
        if (fields.datum[0]=="") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Datum is Required' });
        }
        
        if(fields.report_type_id[0] != 2){ 
            if (!fields.sachkundiger_id || !fields.sachkundiger_id[0]) {
                return res.status(400).json({code: 400, status: 'Validation Error', message: 'Name Sachkundiger is Required' });
            }
            if (fields.sachkundiger_id[0]=="") {
                return res.status(400).json({code: 400, status: 'Validation Error', message: 'Name Sachkundiger is Required' });
            }
        }else{
            fields.sachkundiger_id[0] = user.ID;
        }
        
        var totalCount = 0;
        var tableName = "";
        var recordList = [];
        var recordListHeader = [];
        var arraylist = [];
        var recordListHeaderJson;
        var arrayListJson;
        var newObject;
        var signatureUser = await UserModel.findByPk(fields.sachkundiger_id[0]);
        if (!signatureUser) {
            return res.status(400).json({code: 400, status:'Error', message: 'Selected user not found' });
        }

        if(fields.report_type_id[0] == 1){      // Checklist Report 

            let data1 = await db.sequelize.query('CALL getReportBySCandRType(:reporttype_id, :s_id)', {
                replacements: {
                    reporttype_id: fields.report_type_id[0],
                    s_id: fields.id[0]
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            if(data1.length>0){
                reportUpdate = await updateChecklistReport(fields, file, signatureUser, user);
                let responseResult = { code: reportUpdate[0], status: reportUpdate[1], message: reportUpdate[2] };
                if (reportUpdate[0] === 201) responseResult.successid = reportUpdate[3];
                console.log("Return here");
                return res.status(reportUpdate[0]).json(responseResult);
            }else{
                var clientupdatedURLv2 = null;
                if (!fields.hauptunterschrift || !fields.hauptunterschrift[0]) {
                    return res.status(400).json({code: 400, status: 'Validation Error', message: 'Hauptunterschrift is Required' });
                }
                if (fields.hauptunterschrift [0]=="") {
                    return res.status(400).json({code: 400, status: 'Validation Error', message: 'Hauptunterschrift is Required' });
                }
                
                let baug_status = false;
                if (file.signature && file.signature.length > 0) {
                    getimgpath = imageService.saveFile(file.signature[0],1);
                    if(getimgpath.code != 201){
                        return res.status(getimgpath.code).json({code: getimgpath.code, status: getimgpath.status, message: getimgpath.message });
                    }else{
                        clientupdatedURL = getimgpath.message;
                        if(fields.hauptunterschrift[0] == "true"){
                            clientupdatedURLv2 = clientupdatedURL;
                        }
                    }
                }
                let dt_status = [];
                if (!fields.data) {
                }else{
                    dt_status = fields.data[0];
                    if (dt_status.length <= 0) {
                        dt_status = [];
                    }else{
                        dt_status = JSON.parse(fields.data[0]);
                    }
                }
                sp = "getReportDataOfServiceContract";
                const data = await db.sequelize.query('CALL '+sp+'(:s_id)', {
                    replacements: {
                        s_id: fields.id[0]
                    },
                    type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
                });
                var obj = [];
                var i = -1 ;
                var j = 0;
                if(data.length>0){
                    totalCount = data[0].Count;
                    tableName = "Checklist Report";
                    recordListHeader = new ChecklistHeader(data[0]);
                    recordList = data.map(newdata => new ChecklistRecords(newdata));
                    var baugid = 0;
                    var matchingkey;
                    var esignature = null;
                    for (const key in recordList) {
                        baugid = recordList[key].baugruppe_id;
                        if(matchingkey == baugid){
                            j++;
                            var newRecord = {
                                be_nr: recordList[key].be_nr,
                                bauelement: recordList[key].bauelement,
                                tatigkeit: recordList[key].tatigkeit,
                                bemerkung: recordList[key].bemerkung,
                            };
                            arraylist[i].record.push(newRecord);
                        }else{
                            j = 0;
                            i++;
                            baug_status = false;
                            esignature = null;
                            signature_by = null;
                            signature_at = null;
                            created_by = null;
                            signature_emp_name = null;
                            created_by_name = null;
                            matchingkey = recordList[key].baugruppe_id;
                            const isValueInArray = dt_status.some(item => item === matchingkey);
                            if (isValueInArray) {
                                baug_status = true;
                                esignature = clientupdatedURL;
                                signature_by = signatureUser.ID;
                                signature_emp_name = signatureUser.NAME_FIRST +" "+ signatureUser.NAME_LAST;
                                signature_at = fields.datum[0];
                                created_by = user.ID;
                                created_by_name = user.NAME_FIRST +" "+ user.NAME_LAST;
                            }
                            arraylist[i] = {
                                baugruppe_id: recordList[key].baugruppe_id,
                                bgnr: recordList[key].bgnr,
                                baugruppe: recordList[key].baugruppe,
                                hinweis_letzte_sv: recordList[key].hinweis_letzte_sv,
                                progress: recordList[key].progress,
                                signature_status: baug_status,
                                signature: esignature,
                                signature_by: signature_by,
                                signature_by_name: signature_emp_name,
                                signature_at: signature_at,
                                created_by: created_by,
                                created_by_name: created_by_name,
                                record: [{
                                    be_nr: recordList[key].be_nr,
                                    bauelement: recordList[key].bauelement,
                                    tatigkeit: recordList[key].tatigkeit,
                                    bemerkung: recordList[key].bemerkung,
                                }],
                                baugruppe_nr: recordList[key].baugruppe_nr,
                            };
                        }
                    }
                }

                recordListHeaderJson = JSON.stringify(recordListHeader);
                arrayListJson = JSON.stringify(arraylist);
                
                
                
                newObject = await db.sequelize.query('CALL addReport(:reporttype_id, :s_id, :name_sach, :datum, :url, :empurl, :tcount, :rheader, :rdata, :userId)', {
                    replacements: {
                        reporttype_id: fields.report_type_id[0],
                        s_id: fields.id[0],
                        name_sach: fields.sachkundiger_id[0],
                        datum: fields.datum[0],
                        url: clientupdatedURLv2,
                        empurl: null,
                        tcount: totalCount,
                        rheader:recordListHeaderJson,
                        rdata:arrayListJson,
                        userId: user.ID
                    },
                    type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
                });
            }
        }
        else if(fields.report_type_id[0] == 3){      // M Report 
            
            if (file.signature && file.signature.length > 0) {
                getimgpath = imageService.saveFile(file.signature[0],1);
                if(getimgpath.code != 201){
                    return res.status(getimgpath.code).json({code: getimgpath.code, status: getimgpath.status, message: getimgpath.message });
                }else{
                    clientupdatedURL = getimgpath.message;
                }
            }
            sp = "getReportDataOfServiceContractV2";
            const data = await db.sequelize.query('CALL '+sp+'(:s_id)', {
                replacements: {
                    s_id: fields.id[0]
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            var obj = [];
            var i = -1 ;
            var j = 0;
            if(data.length>0){
                totalCount = data[0].Count;
                tableName = "Checklist Report";
                recordListHeader = new ChecklistHeader(data[0]);
                recordList = data.map(newdata => new ChecklistRecords(newdata));
                var baugid = 0;
                var matchingkey;
                for (const key in recordList) {
                    baugid = recordList[key].baugruppe_id;
                    if(matchingkey == baugid){
                        j++;
                        var newRecord = {
                            bauelement: recordList[key].bauelement,
                            tatigkeit: recordList[key].tatigkeit,
                            bemerkung: recordList[key].bemerkung,
                        };
                        arraylist[i].record.push(newRecord);
                    }else{
                        j = 0;
                        i++;
                        matchingkey = recordList[key].baugruppe_id;
                        arraylist[i] = {
                            baugruppe_id: recordList[key].baugruppe_id,
                            bgnr: recordList[key].bgnr,
                            baugruppe: recordList[key].baugruppe,
                            hinweis_letzte_sv: recordList[key].hinweis_letzte_sv,
                            progress: recordList[key].progress,
                            record: [{
                                bauelement: recordList[key].bauelement,
                                tatigkeit: recordList[key].tatigkeit,
                                bemerkung: recordList[key].bemerkung,
                            }],
                        };
                    }
                }
            }

            recordListHeaderJson = JSON.stringify(recordListHeader);
            arrayListJson = JSON.stringify(arraylist);
            
            newObject = await db.sequelize.query('CALL addReport(:reporttype_id, :s_id, :name_sach, :datum, :url, :empurl, :tcount, :rheader, :rdata, :userId)', {
                replacements: {
                    reporttype_id: fields.report_type_id[0],
                    s_id: fields.id[0],
                    name_sach: fields.sachkundiger_id[0],
                    datum: fields.datum[0],
                    url: clientupdatedURL,
                    empurl: null,
                    tcount: totalCount,
                    rheader:recordListHeaderJson,
                    rdata:arrayListJson,
                    userId: user.ID
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });

        }
        else if(fields.report_type_id[0] == 2){  // Anlagenlist Report
            const data = await db.sequelize.query('CALL getServiceContractById(:s_id)', {
                replacements: {
                    s_id: fields.id[0]
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            if(data.length>0){
                tableName = "Service Contract Info";
                recordListHeader = new ChecklistHeader(data[0]);
            }
            const data1 = await db.sequelize.query('CALL getInstallationsBaugruppeAgainstServiceContract(:s_id)', {
                replacements: {
                    s_id: fields.id[0]
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            arraylist = data1.map(newdata => new MachineInstallationDTO(newdata));
            if(data1.length>0){
                tableName = "Anlagen Report List";
                totalCount = data1.length;
            }
            recordListHeaderJson = JSON.stringify(recordListHeader);
            arrayListJson = JSON.stringify(arraylist);
            
            newObject = await db.sequelize.query('CALL addReport(:reporttype_id, :s_id, :name_sach, :datum, :url, :empurl, :tcount, :rheader, :rdata, :userId)', {
                replacements: {
                    reporttype_id: fields.report_type_id[0],
                    s_id: fields.id[0],
                    name_sach: fields.sachkundiger_id[0],
                    datum: fields.datum[0],
                    url: null,
                    empurl: null,
                    tcount: totalCount,
                    rheader:recordListHeaderJson,
                    rdata:arrayListJson,
                    userId: user.ID
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
        }
        else if(fields.report_type_id[0] == 4){  // Tatigeit Report
            if (file.signature && file.signature.length > 0) {
                getimgpath = imageService.saveFile(file.signature[0],1);
                if(getimgpath.code != 201){
                    return res.status(getimgpath.code).json({code: getimgpath.code, status: getimgpath.status, message: getimgpath.message });
                }else{
                    clientupdatedURL = getimgpath.message;
                }
            }

            if (file.emp_signature && file.emp_signature.length > 0) {
                var getimgpath1 = imageService.saveFile(file.emp_signature[0],1);
                if(getimgpath1.code != 201){
                    return res.status(getimgpath1.code).json({code: getimgpath1.code, status: getimgpath1.status, message: getimgpath1.message });
                }else{
                    employeeupdatedURL = getimgpath1.message;
                }
            }

            const data = await db.sequelize.query('CALL getServiceContractById(:s_id)', {
                replacements: {
                    s_id: fields.id[0]
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            if(data.length>0){
                recordListHeader = new ChecklistHeader(data[0]);
            }
            recordListHeader.ansprechpartner = fields.ansprechpartner && fields.ansprechpartner[0] ? fields.ansprechpartner[0] : null;
            recordListHeader.auftraggeber = fields.auftraggeber && fields.auftraggeber[0] ? fields.auftraggeber[0] : null;
            recordListHeader.verantwortlicher = fields.verantwortlicher && fields.verantwortlicher[0] ? fields.verantwortlicher[0] : null;
            recordListHeader.ausgefuhrte = fields.ausgefuhrte && fields.ausgefuhrte[0] ? fields.ausgefuhrte[0] : null;

            arraylist[0] = {  
                wartung: fields.wartung && fields.wartung[0] ? fields.wartung[0] : null,
                nicht_fertiggestelte: fields.nicht_fertiggestelte && fields.nicht_fertiggestelte[0] ? fields.nicht_fertiggestelte[0] : null,
                material_bemerkungen: fields.material_bemerkungen && fields.material_bemerkungen[0] ? fields.material_bemerkungen[0] : null,
            };

            recordListHeaderJson = JSON.stringify(recordListHeader);
            arrayListJson = JSON.stringify(arraylist);
            
            newObject = await db.sequelize.query('CALL addReport(:reporttype_id, :s_id, :name_sach, :datum, :url, :empurl, :tcount, :rheader, :rdata, :userId)', {
                replacements: {
                    reporttype_id: fields.report_type_id[0],
                    s_id: fields.id[0],
                    name_sach: fields.sachkundiger_id[0],
                    datum: fields.datum[0],
                    url: clientupdatedURL,
                    empurl: employeeupdatedURL,
                    tcount: 1,
                    rheader:recordListHeaderJson,
                    rdata:arrayListJson,
                    userId: user.ID
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });

        }else{
        
        }
        console.log("OR Return here");
        res.status(201).json({code: 201, status:'Success', message:'Report Save Successfully!', successid: newObject[0].id});
        res.end();
      } catch (error) 
      {
        console.log(error);
        res.status(500).json({code: 500, status:'Error', message: error.message, error:error});
      }
    });
}  

const getReportById = async (req, res, next) => {
    const { id = ''} = req.query;
    try {
        if (id == "") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: "Report Id is required" });
        }
        const data = await db.sequelize.query('CALL getReportById(:id)', {
            replacements: {
                id: id
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        var totalCount = 0;
        var tableName = "";
        if(data.length>0){
            totalCount = data[0].numberofrecords;
            tableName = data[0].report_type + " Report";
            var rHeader = JSON.parse(data[0].reportheader);
			rHeader.kunde_email = data[0].kunde_email;
            var rdata = JSON.parse(data[0].report);
            var submittedrecord = {
                datum: data[0].datum,
                name_sachkundiger: data[0].employeename,
                signature: data[0].signation,
                emp_signature: data[0].employee_signature,
                createdAt: data[0].createdAt,
            };
            res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
                    NumberOfRecords: totalCount, tableName: tableName, recordListHeader: rHeader,
                    recordList: rdata, submittedrecord: submittedrecord});
        }else{
            res.status(500).json({ code: 500, status:'Error', message: 'No Record Found' });
        }
    } catch (error) {
      console.log(error);
      res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error' });
    }
}

const getReportUpdateById = async (req, res, next) => {
    const { id = ''} = req.query;
    try {
        if (id == "") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: "Report Id is required" });
        }
        const data = await db.sequelize.query('CALL getReportById(:id)', {
            replacements: {
                id: id
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        var totalCount = 0;
        var tableName = "";
        if(data.length>0){
            if(data[0].report_type_id != 1){
                return res.status(400).json({code: 400, status: 'Validation Error', message: "Only checklist report has the access to update" });
            }
            totalCount = data[0].numberofrecords;
            tableName = data[0].report_type + " Report";
            var rHeader = JSON.parse(data[0].reportheader);
            var rdata = JSON.parse(data[0].report);
            var submittedrecord = {
                datum: data[0].datum,
                name_sachkundiger: data[0].employeename,
                signature: data[0].signation,
                emp_signature: data[0].employee_signature,
                createdAt: data[0].createdAt,
            };
            
            //New Record Data: 
            const data_new = await db.sequelize.query('CALL getReportDataOfServiceContract(:s_id)', {
                replacements: {
                    s_id: data[0].service_contract_id
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
            var i = -1;
            var j = 0;
            var recordList_new = [];
            var arraylist_new = [];
            if(data_new.length>0){
                recordList_new = data_new.map(newdata => new ChecklistRecords(newdata));
                var baugid = 0;
                var matchingkey;
                for (const key in recordList_new) {
                    baugid = recordList_new[key].baugruppe_id;
                    if(matchingkey == baugid){
                        j++;
                        var newRecord = {
                            be_nr: recordList_new[key].be_nr,
                            bauelement: recordList_new[key].bauelement,
                            tatigkeit: recordList_new[key].tatigkeit,
                            bemerkung: recordList_new[key].bemerkung,
                        };
                        arraylist_new[i].record.push(newRecord);
                    }else{
                        j = 0;
                        i++;
                        matchingkey = recordList_new[key].baugruppe_id;
                        arraylist_new[i] = {
                            baugruppe_id: recordList_new[key].baugruppe_id,
                            bgnr: recordList_new[key].bgnr,
                            baugruppe: recordList_new[key].baugruppe,
                            hinweis_letzte_sv: recordList_new[key].hinweis_letzte_sv,
                            progress: recordList_new[key].progress,
                            record: [{
                                be_nr: recordList_new[key].be_nr,
                                bauelement: recordList_new[key].bauelement,
                                tatigkeit: recordList_new[key].tatigkeit,
                                bemerkung: recordList_new[key].bemerkung,
                            }],
                            baugruppe_nr: recordList_new[key].baugruppe_nr,
                        };
                    }
                }
            }

            for (const key1 in arraylist_new) {
                var check = 0;
                for (const key2 in rdata) {
                    if(arraylist_new[key1].baugruppe_id == rdata[key2].baugruppe_id){
                        check = 1;
                    }
                }
                if(check == 0) rdata[rdata.length] = arraylist_new[key1];
            }
            for (const key in rdata) {
                if(rdata[key].signature_status == false){
                    var baugruppeid_rdata = rdata[key].baugruppe_id;
                    rdata[key] = {};
                    for (const key1 in arraylist_new) {
                        if(arraylist_new[key1].baugruppe_id == baugruppeid_rdata){
                            rdata[key] = arraylist_new[key1];
                        }
                    }
                }
            }
            rdata = rdata.filter(obj => Object.keys(obj).length !== 0);
            
            res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
                    NumberOfRecords: totalCount, tableName: tableName, recordListHeader: rHeader,
                    recordList: rdata, submittedrecord: submittedrecord});
        }else{
            res.status(500).json({ code: 500, status:'Error', message: 'No Record Found' });
        }
    } catch (error) {
      console.log(error);
      res.status(500).json({ code: 500, status:'Error', message: 'Internal Server Error' });
    }
}

async function updateChecklistReport(fields, file, signatureUser, user){
    var totalCount = 0;
    var tableName = "";
    var recordList = [];
    var recordListHeader = [];
    var arraylist = [];
    var recordListHeaderJson;
    var arrayListJson;
    var newObject;
    var clientupdatedURLv2 = null;
    if (!fields.hauptunterschrift?.[0] || fields.hauptunterschrift[0] === "") {
        return [400,'Validation Error', 'Hauptunterschrift is Required'];
    }
    
    let baug_status = false;
    if (file.signature && file.signature.length > 0) {
        getimgpath = imageService.saveFile(file.signature[0],1);
        if(getimgpath.code != 201){
            return [getimgpath.code,getimgpath.status, getimgpath.message];
        }else{
            clientupdatedURL = getimgpath.message;
            if(fields.hauptunterschrift[0] == "true"){
                clientupdatedURLv2 = clientupdatedURL;
            }
        }
    }

    let dt_status = [];
    if (!fields.data) {
    }else{
        dt_status = fields.data[0];
        if (dt_status.length <= 0) {
            dt_status = [];
        }else{
            dt_status = JSON.parse(fields.data[0]);
        }
    }

    //Get New Record Which we inserted
    let data1 = null;
    console.log("Check report id");
    console.log(fields.report_id);
    if (!fields.report_id?.[0] || fields.report_id[0] === "0") {
        data1 = await db.sequelize.query('CALL getReportBySCandRType(:reporttype_id, :s_id)', {
            replacements: {
                reporttype_id: fields.report_type_id[0],
                s_id: fields.id[0]
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        console.log("here1");
    }else{
        data1 = await db.sequelize.query('CALL getReportById(:id)', {
            replacements: {
                id: fields.report_id[0]
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        console.log("here2");
    }
    var totalCount = 0;
    var tableName = "";
    if(data1.length>0){
        if(data1[0].report_type_id != 1){
            return [400,'Validation Error', 'Only checklist report has the access to update'];
        }
        totalCount = data1[0].numberofrecords;
        tableName = data1[0].report_type + " Report";
        var rHeader = JSON.parse(data1[0].reportheader);
        var rdata = JSON.parse(data1[0].report);
        var submittedrecord = {
            datum: data1[0].datum,
            name_sachkundiger: data1[0].employeename,
            signature: data1[0].signation,
            emp_signature: data1[0].employee_signature,
            createdAt: data1[0].createdAt,
        };
        if(clientupdatedURLv2 == null){
            clientupdatedURLv2 = data1[0].signation;
        }
        
        //New Record Data: 
        const data_new = await db.sequelize.query('CALL getReportDataOfServiceContract(:s_id)', {
            replacements: {
                s_id: data1[0].service_contract_id
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        var i = -1 ;
        var j = 0;
        var recordList_new = [];
        var arraylist_new = [];
        if(data_new.length>0){
            recordListHeader = new ChecklistHeader(data_new[0]);
            recordList_new = data_new.map(newdata => new ChecklistRecords(newdata));
            totalCount = data_new[0].Count;
            arraylist = rdata;
            tableName = "Checklist Report";
            var baugid = 0;
            var matchingkey;
            for (const key in recordList_new) {
                baugid = recordList_new[key].baugruppe_id;
                if(matchingkey == baugid){
                    j++;
                    var newRecord = {
                        be_nr: recordList_new[key].be_nr,
                        bauelement: recordList_new[key].bauelement,
                        tatigkeit: recordList_new[key].tatigkeit,
                        bemerkung: recordList_new[key].bemerkung,
                    };
                    arraylist_new[i].record.push(newRecord);
                }else{
                    j = 0;
                    i++;
                    matchingkey = recordList_new[key].baugruppe_id;
                    arraylist_new[i] = {
                        baugruppe_id: recordList_new[key].baugruppe_id,
                        bgnr: recordList_new[key].bgnr,
                        baugruppe: recordList_new[key].baugruppe,
                        hinweis_letzte_sv: recordList_new[key].hinweis_letzte_sv,
                        progress: recordList_new[key].progress,
                        record: [{
                            be_nr: recordList_new[key].be_nr,
                            bauelement: recordList_new[key].bauelement,
                            tatigkeit: recordList_new[key].tatigkeit,
                            bemerkung: recordList_new[key].bemerkung,
                        }],
                        baugruppe_nr: recordList_new[key].baugruppe_nr,
                    };
                }
            }
        }

        for (const key1 in arraylist_new) {
            var check = 0;
            for (const key2 in rdata) {
                if(arraylist_new[key1].baugruppe_id == rdata[key2].baugruppe_id){
                    check = 1;
                }
            }
            if(check == 0) rdata[rdata.length] = arraylist_new[key1];
        }
        
        for (const key in rdata) {
            if(rdata[key].signature_status == false || rdata[key].signature_status == undefined){
                var baugruppeid_rdata = rdata[key].baugruppe_id;
                rdata[key] = {};
                for (const key1 in arraylist_new) {
                    if(arraylist_new[key1].baugruppe_id == baugruppeid_rdata){
                        rdata[key] = arraylist_new[key1];
                        matchingkey = baugruppeid_rdata;
                        const isValueInArray = dt_status.some(item => item === matchingkey);
                        if (isValueInArray) {
                            rdata[key].signature_status = true;
                            rdata[key].signature = clientupdatedURL;
                            rdata[key].signature_by = signatureUser.ID;
                            rdata[key].signature_by_name = signatureUser.NAME_FIRST +" "+ signatureUser.NAME_LAST;
                            rdata[key].signature_at = fields.datum[0];
                            rdata[key].created_by = user.ID;
                            rdata[key].created_by_name = user.NAME_FIRST +" "+ user.NAME_LAST;
                        }else{
                            rdata[key].signature_status = false;
                            rdata[key].signature = null;
                            rdata[key].signature_by = null;
                            rdata[key].signature_by_name = null;
                            rdata[key].signature_at = null;
                            rdata[key].created_by = null;
                            rdata[key].created_by_name = null;
                        }
                    }
                }
            }
        }
        rdata = rdata.filter(obj => Object.keys(obj).length !== 0);
        arraylist = rdata;
    }
    recordListHeaderJson = JSON.stringify(recordListHeader);
    arrayListJson = JSON.stringify(arraylist);
    
    newObject = await db.sequelize.query('CALL updateReport(:report_id, :reporttype_id, :s_id, :name_sach, :datum, :url, :empurl, :tcount, :rheader, :rdata, :userId)', {
        replacements: {
            report_id: data1[0].id,
            reporttype_id: fields.report_type_id[0],
            s_id: fields.id[0],
            name_sach: fields.sachkundiger_id[0],
            datum: fields.datum[0],
            url: clientupdatedURLv2,
            empurl: null,
            tcount: totalCount,
            rheader:recordListHeaderJson,
            rdata:arrayListJson,
            userId: user.ID
        },
        type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
    });
    return [201,'Success', 'Report Update Successfully!', newObject[0].id];
}

async  function updateReport(req,res,next){
    const user = req.user;    // req.user;
    var clientupdatedURL = '';
    var employeeupdatedURL = '';
    var getimgpath;
    let form = new formidable.IncomingForm();
    form.parse(req, async function (error, fields, file) 
    {
      try {
        if (!fields.id || !fields.id.length > 0) {
          return res.status(400).json({code: 400, status: 'Validation Error', message: 'Service Contract Nr is Required' });
        }
        if (fields.id[0]=="") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Service Contract Nr is Required' });
        }
        if (!fields.report_type_id || !fields.report_type_id[0]) {
          return res.status(400).json({code: 400, status: 'Validation Error', message: 'Report Type Id is Required' });
        }
        if (fields.report_type_id[0]=="") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Report Type Id is Required' });
        }

        if (!fields.datum || !fields.datum[0]) {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Datum is Required' });
        }
        if (fields.datum[0]=="") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Datum is Required' });
        }

        if (!fields.sachkundiger_id || !fields.sachkundiger_id[0]) {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Name Sachkundiger is Required' });
        }
        if (fields.sachkundiger_id[0]=="") {
            return res.status(400).json({code: 400, status: 'Validation Error', message: 'Name Sachkundiger is Required' });
        }

        var signatureUser = await UserModel.findByPk(fields.sachkundiger_id[0]);
        if (!signatureUser) {
            return res.status(400).json({code: 400, status:'Error', message: 'Selected user not found' });
        }
        var reportUpdate = [];
        if(fields.report_type_id[0] == 1){      // Checklist Report 
            reportUpdate = await updateChecklistReport(fields, file, signatureUser, user);
            let responseResult = { code: reportUpdate[0], status: reportUpdate[1], message: reportUpdate[2] };
            if (reportUpdate[0] === 201) responseResult.successid = reportUpdate[3];
            res.status(reportUpdate[0]).json(responseResult);
        }else{
            res.status(400).json({code: 400, status:'Validation Error', message:'Only checklist report has the access to update'});
        }
        res.end();
      } catch (error) 
      {
        console.log(error);
        res.status(500).json({code: 500, status:'Error', message: error.message, error:error});
      }
    });
}

async function emailReport(req,res,next){
  const { id, email1, email2 = '', email3 = '', subject, message = ''} = req.body;
  const user = req.user;    // req.user;
  // Validate input using the imported validateRoles array
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  }
  try {
        var to = email1;
        if (email2 != "" ) {
            to = to+","+email2;
        }
        if (email3 != "" ) {
            to = to+","+email3;
        }
        var getEmailStatus =  await email.sent_Email(to,subject,message,null,null);
        var m_status = 1;
        if(getEmailStatus.code != 200){
            m_status = 0;
        }
        const newObject = await DispatchEmailModel.create({
            report_id: id,
            email: to,
            subject: subject,
            message: message,
            email_status: m_status,
            status_message: JSON.stringify(getEmailStatus.message),
            createdBy: user.ID
        });
        return res.status(getEmailStatus.code).json({code: getEmailStatus.code, status: getEmailStatus.status, message: getEmailStatus.message });
    } catch (error) {
        res.status(500).json({code: 500, status:'Error', message: 'Internal Server Error' });
    }
}

module.exports = {
    getReport,
    getAllReports,
    addReport,
    getReportById,
    getReportUpdateById,
    updateReport,
    emailReport
};
  
 