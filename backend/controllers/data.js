const Data = require("../models/data");
const DataManager = require("./dataManager");
var zlib = require('zlib');

const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

function saveData(body) {
    //let base64CSV= JSON.stringify(body);
    let date= new Date(body.date);
    let day= new Date(date.toDateString()).getTime();
    let hour= date.getHours();
    if(body.lid){
        let fileName=  day + '-' + hour + '-' + body.lid + '.csv';
       DataManager.saveCSVFile( fileName.toLowerCase(), body.leftInsole, day, hour, body.lid);
    }
    if(body.rid){
        let fileName=  day + '-' + hour + '-' + body.rid + '.csv';
       DataManager.saveCSVFile( fileName.toLowerCase(), body.rightInsole, day, hour, body.rid);
    }
    
}

exports.uploadData = (req, res, err) => {
   console.log(req.body.rightInsole);
   saveData(req.body);
   res.status(200).json({
    message: "Data recieved"
   });
   /*if(req.headers['content-encoding'] == 'gzip') {
       zlib.gunzip(req.body, function(err, dezipped) {
            saveData(dezipped);
       });
   } else {
        saveData(dezipped);
   }*/
   
};
