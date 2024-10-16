const db = require("../models/ApplyRelation");
const {UserHasInstallationModel} = db;
const { Sequelize, QueryTypes } = require('sequelize');
const InstallationDTO = require('../dtos/installtiondto');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;

async function getAssignedObjectToUser(req, res) {
    const { id = '' , search = ''} = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "User Id is required" });
        }
        const data = await db.sequelize.query('CALL getAssignedObjectToUser(:userId, :search)', {
            replacements: {
                userId: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        let recordList;
        recordList = data.map(newdata => new InstallationDTO(newdata));

        var tableName = "Assigned Objekt";
        var totalCount = 0;
        if (data.length > 0) {
            totalCount = data[0].Count;
        }
        res.status(200).json({
            code: 200, status: 'Successful', message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
}

async function getUnAssignedObjectToUser(req, res) {
    const { id = '', search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "User Id is required" });
        }
        const data = await db.sequelize.query('CALL getUnAssignedObjectToUser(:userId, :search)', {
            replacements: {
                userId: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        let recordList;
        recordList = data.map(newdata => new InstallationDTO(newdata));
        var tableName = "Unassigned Objekt";
        var totalCount = 0;
        if (data.length > 0) {
            totalCount = data[0].Count;
        }
        res.status(200).json({
            code: 200, status: 'Successful', message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList
        });

    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
}

const assignObjectToUser = async (req, res, next) => {
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
        dt.forEach(async element => {
            if (error == 0) {
                if (element.id == "" || element.id === undefined) {
                    error = 1;
                } else if (element.kunden_nr == "" || element.kunden_nr === undefined) {
                    error = 2;
                } else {
                    data = await db.sequelize.query('CALL assignObjectToUser(:kunden_nr,:assignuserid,:userId)', {
                        replacements: {
                            kunden_nr: element.kunden_nr,
                            assignuserid: element.id,
                            userId: user.ID,
                        },
                        type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
                    });
                }
            }
        });
        if (error == 1) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "User Nr is required" });
        } else if (error == 2) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Kunden Nr is required" });
        } else {
            res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Internal Server Error' });
    }
};

module.exports = {
    getAssignedObjectToUser,
    getUnAssignedObjectToUser,
    assignObjectToUser
};