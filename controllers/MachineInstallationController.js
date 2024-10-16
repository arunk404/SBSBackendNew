const db = require("../models/ApplyRelation");
const { MachineInstallationsModel, MachineModel, BaugruppeServiceContractModel } = db;
const { MachineInstallationDTO, MachineInstallationWithSignatureDTO, MachineInstallationDTO_Id, Baugruppelist } = require('../dtos/machinedto');
const { validationResult } = require('express-validator');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


async function getBaugruppeInstallation(req, res) {
    const { id = '', s_id = '', search = '', page = 1, limit = 50, code = 0, records = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Id is required" });
        }
        if (code == 0 || code == 1) { } else {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Error is with given code" });
        }
        const offset = (page - 1) * limit;
        let data = null ;
        if(s_id == ''){
            data = await db.sequelize.query('CALL getInstallationsBaugruppe(:installation_id, :search, :records, :p_limit, :p_offset)', {
                replacements: {
                    installation_id: id,
                    search: search,
                    records: records,
                    p_limit: limit,
                    p_offset: offset
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
        }else{
            data = await db.sequelize.query('CALL getMachineProgress(:installation_id, :s_id, :search, :records, :p_limit, :p_offset)', {
                replacements: {
                    installation_id: id,
                    s_id: s_id,
                    search: search,
                    records: records,
                    p_limit: limit,
                    p_offset: offset
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
        }
        
        // const mappedData = data.rows; // Access the rows property to get the array of results
        let recordList = [];
        if(data[0].currentData == 0){
            if (code == 1) {
                recordList = data.map(newdata => new MachineInstallationDTO_Id(newdata));
            } else {
                recordList = data.map(newdata => new MachineInstallationWithSignatureDTO(newdata));
            }
        }
        var tableName = "";
        var totalCount = 0;
        if (data.length > 0) {
            totalCount = data[0].Count;
            tableName = data[0].kunde;
        }
        res.status(200).json({
            code: 200, status: 'Successful', message: 'Record extracted successfully',
            NumberOfRecords: totalCount, PageNumber: page, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
}

async function getAssignedBaugruppeInstallation(req, res) {
    const { id = '', search = '', page = 1, limit = 50, code = 0, records = 'all' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Id is required" });
        }
        const offset = (page - 1) * limit;
        const data = await db.sequelize.query('CALL getInstallationsBaugruppe(:installation_id, :search, :records, :p_limit, :p_offset)', {
            replacements: {
                installation_id: id,
                search: search,
                records: records,
                p_limit: limit,
                p_offset: offset
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        let recordList;
        recordList = data.map(newdata => new Baugruppelist(newdata, false));

        var tableName = "Assigned Baugruppe";
        var totalCount = 0;
        if (data.length > 0) {
            totalCount = data[0].Count;
            // tableName = data[0].kunde;
        }
        res.status(200).json({
            code: 200, status: 'Successful', message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
}

async function getUnAssignedBaugruppeInstallation(req, res) {
    const { id = '', search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Id is required" });
        }
        const data = await db.sequelize.query('CALL getUnAssignedInstallationsBaugruppe(:installation_id, :search)', {
            replacements: {
                installation_id: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });

        let recordList;
        recordList = data.map(newdata => new Baugruppelist(newdata, true));
        var tableName = "Unassigned Baugruppe";
        var totalCount = 0;
        if (data.length > 0) {
            totalCount = data[0].Count;
            // tableName = data[0].kunde;
        }
        res.status(200).json({
            code: 200, status: 'Successful', message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList
        });

    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
}

const AssignBaugruppeInstallation = async (req, res, next) => {
    var obj = req.body;
    const user = req.user;    // req.user;
    if (!obj.data) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records is required" });
    }
    try {
        let dt = JSON.parse(obj.data);
        if (dt.length <= 0) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records is required" });
        }
        let data;
        var error = 0;
        dt.forEach(async baugruppe => {
            if (error == 0) {
                if (baugruppe.kunden_nr == "" || baugruppe.kunden_nr === undefined) {
                    error = 1;
                } else if (baugruppe.baugruppe_nr == "" || baugruppe.baugruppe_nr === undefined) {
                    error = 2;
                } else {
                    data = await db.sequelize.query('CALL assignBaugruppeInstallation(:kunden_nr,:baugruppe_nr,:userId)', {
                        replacements: {
                            kunden_nr: baugruppe.kunden_nr,
                            baugruppe_nr: baugruppe.baugruppe_nr,
                            userId: user.ID,
                        },
                        type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
                    });
                }
            }
        });
        if (error == 1) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Kunden Nr is required" });
        } else if (error == 2) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Nr is required" });
        } else {
            res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
};

const AssignBaugruppeInstallationByNewBaugruppe = async (req, res, next) => {
    const { bgnr, baugruppe, baugruppe_nr, kunden_nr } = req.body;
    const user = req.user;    // req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {
        const newBaugruppe = await MachineModel.create({
            bgnr: bgnr,
            baugruppe: baugruppe,
            createdBy: user.ID
        });
        const newBaugruppeId = newBaugruppe.id;
        const newBaugruppeInstallation = await MachineInstallationsModel.create({
            installation_id: kunden_nr,
            baugruppe_id: newBaugruppeId,
            baugruppe_template_id: baugruppe_nr,
            createdBy: user.ID
        });
        res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
};

const AssignBaugruppeInstallationWithNewInstant = async (req, res, next) => {
    var obj = req.body;
    const user = req.user;    // req.user;
    let msg = "";

    if (!obj.data) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Records is required" });
    }
    try {
        var data = [];
        var data_ids = [];
        var data_baugruppe_service_table = [];
        var error = 0;
        let dt = JSON.parse(obj.data);
        dt.forEach(async element => {
            if(error == 0)
            {
                if (element.kunden_nr == "" || element.kunden_nr === undefined) {
                    error = 1;
                    msg = "Kunden Nr is required";
                } else if (element.baugruppe_nr == "" || element.baugruppe_nr === undefined) {
                    error = 2;
                    msg = "Baugruppe Nr is required";
                } else if (element.baugruppe == "" || element.baugruppe === undefined) {
                    error = 3;
                    msg = "Baugruppe is required";
                } else if (!(element.hasOwnProperty('isnew'))) {
                    error = 4;
                    msg = "Is New is required";
                } else if (!(element.hasOwnProperty('auto_insertion'))) {
                    error = 5;
                    msg = "Auto Insertion is required";
                } else {
                    if (element.isnew == true) {
                        data.push({ bgnr: element.bgnr, baugruppe: element.value, createdBy: user.ID });
                        data_ids.push({
                            installation_id: element.kunden_nr, baugruppe_template_id: element.baugruppe_nr
                            , createdBy: user.ID, baugruppe_id: 0
                        });
                    } else {
                        const updateBaugruppe = await MachineModel.findByPk(element.baugruppe_nr);
                        if (!updateBaugruppe) {
                            return res.status(404).json({ code: 404, status: 'Error', message: 'Baugruppe not found' });
                        }
                        updateBaugruppe.bgnr = element.bgnr;
                        updateBaugruppe.baugruppe = element.baugruppe;
                        updateBaugruppe.updatedBy = user.ID;
                        const serviceContractdata = await updateBaugruppe.save();
                    }
                }
            }
        });
        if(msg != "")
        {
            return res.status(400).json({code: 400, status: 'Validation Error', message: msg });
        }else{
            if (data.length > 0) {
                MachineModel.bulkCreate(data, { returning: true, raw: true })
                    .then((insertedData) => {
                        var count = 0;
                        data_ids.forEach(element => {
                            let bid = insertedData[count].dataValues.id;
                            if (bid) {
                                element.baugruppe_id = bid;
                            }
                            count++;
                        });
                        MachineInstallationsModel.bulkCreate(data_ids, { returning: true, raw: true })
                        .then((insertedDataBaug) => {
                            count = 0;
                            var sc_id = null;
                            var baugistallation_id = "";
                            var baug_id = "";
                            dt.forEach(async element => {
                                sc_id = element.service_contract_id ? element.service_contract_id : null;
                                baugistallation_id = insertedDataBaug[count].dataValues.id;
                                baug_id = insertedData[count].dataValues.id;
                                // console.log(baug_id);
                                // console.log(count);
                                data_baugruppe_service_table.push({ service_contract_id: sc_id, baugruppe_installation_id: baugistallation_id, bemerkungen:null, createdBy: user.ID });
                                // console.log(data_baugruppe_service_table);
                                count++;
                                if (element.auto_insertion == true) {
                                    const newObject = await db.sequelize.query('CALL createbauelementandassigntobaugruppeV2(:baug_inst_id,:b_id,:baug_temp_id,:ser_id,:userId)', {
                                        replacements: {
                                            baug_inst_id: baugistallation_id,
                                            b_id: baug_id,
                                            baug_temp_id: element.baugruppe_nr,
                                            ser_id: sc_id,
                                            userId: user.ID
                                        },
                                        type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
                                    });
                                }
                            });
                            BaugruppeServiceContractModel.bulkCreate(data_baugruppe_service_table, { returning: true, raw: true })
                            .then((insertedBaugruppeServiceCotnract) => {
                                res.status(201).json({code: 201, status:'Successful', message: 'Record has been updated successfully' });        
                            }).catch((error) => {
                                res.status(500).json({ code: 500, status: 'Error', message: 'Insertion Failed while Creating bemerkungen on contract' });
                            });
                        }).catch((error) => {
                            res.status(500).json({ code: 500, status: 'Error', message: 'Insertion Failed while Assigning baugrupe to objekt' });
                        });
                    })
                    .catch((error) => {
                        res.status(500).json({ code: 500, status: 'Error', message: 'Insertion Failed while creating baugrupe' });
                    });
            }
            else
            {
                res.status(201).json({code: 201, status:'Successful', message: 'Record has been updated successfully' });
            }
        }
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
};


const deleteBaugruppeInstallation = async (req, res, next) => {
    const { id } = req.query;  //Get Id
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Nr is required" });
    }
    try {
        const machinec = await MachineInstallationsModel.findByPk(id);
        if (!machinec) {
            return res.status(404).json({ code: 404, status: 'Error', message: 'Baugruppe not found' });
        }
        machinec.deletedBy = user.ID;
        const machinedata = await machinec.destroy();
        res.status(201).json({ code: 201, status: 'Successful', message: 'Baugruppe deleted successfully' });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
};


module.exports = {
    getBaugruppeInstallation,
    getAssignedBaugruppeInstallation,
    getUnAssignedBaugruppeInstallation,
    AssignBaugruppeInstallation,
    AssignBaugruppeInstallationByNewBaugruppe,
    AssignBaugruppeInstallationWithNewInstant,
    deleteBaugruppeInstallation
};

