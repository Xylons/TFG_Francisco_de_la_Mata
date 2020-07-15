const Data = require("../models/data");
const DataManager = require("./dataManager");
var zlib = require('zlib');

const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

function saveData(body) {
    let base64CSV= JSON.stringify(body);
    let file= new Date(body.date).getTime() +'csvFILE.txt';
    DataManager.saveCSVFile( file, base64CSV)
}

exports.uploadData = (req, res, err) => {
   console.log(req.body.rightInsole);
   /*if(req.headers['content-encoding'] == 'gzip') {
       zlib.gunzip(req.body, function(err, dezipped) {
            saveData(dezipped);
       });
   } else {
        saveData(dezipped);
   }*/
   
};
