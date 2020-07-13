const Data = require("../models/data");
const DataManager = require("./dataManager");


const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

exports.uploadData = (req, res, err) => {
   
   let base64CSV= req.body.file;
   let file= 'csvFILE.csv';
    DataManager.saveCSVFile( file, base64CSV)
};
