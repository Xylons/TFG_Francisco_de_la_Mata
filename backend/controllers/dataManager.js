const cron = require("node-cron");
const express = require("express");
const fs = require("fs");
const csv = require("fast-csv");
const path = require('path');

const DashboardController = require("./dashboard");

exports.readCSV =async function getCSVdata() {
  //const stream =fs.createReadStream(__dirname + './file-management/csv-files/LeftData2019.09.02.22.26.32.csv');
  let sensorsSum=[];
  //Inicializo el array a 0
  for(i=0; i< 32; i++){
    sensorsSum.push(0);
  };
  let maxValues = [...sensorsSum];
  let steps=0;
  let stepChanged=false;
  let frontSensors=0;
  let backSensors=0;
  
  console.log(path.resolve(__dirname + './file-management/csv-files/LeftData2019.09.02.22.26.32.csv'))
  await fs.createReadStream('./file-management/csv-files/LeftData2019.09.02.22.26.32.csv')
    .pipe(csv.parse({ headers: false, delimiter: ';' }))
    .on('error', error => console.error(error))
    .on('data', row => {
      frontSensors=0;
      backSensors=0;
      //suma+= parseInt(row[0]); /*console.log(row)*/
      //tomo el valor de los 32 sensores de presión para hacer la media
      for(i=0; i< 32; i++){
        let parsedValue= parseInt(row[i]);
        sensorsSum[i]+= parsedValue;
        if(maxValues[i]< parsedValue){
          maxValues[i]= parsedValue;
        }
        // Los sensores de la punta son del 0-18 y talon de 23-31
        if(i<19){
          frontSensors+= parsedValue;
        }else if(i>22){
          backSensors+= parsedValue;
        }
        if(i=== 31){
          if(frontSensors-backSensors >800 && stepChanged=== false){
            steps++;
            stepChanged=true;
          }else if(frontSensors-backSensors <800 && stepChanged=== true){
            stepChanged=false;
          }
        }
      }
    })
    .on('end', rowCount => {
      for(i=0; i< 32; i++){
        sensorsSum[i]= sensorsSum[i]/rowCount;
      };
      console.log(`Parsed ${rowCount} rows`+ sensorsSum + "   ---------   "+ maxValues+ " steps " + steps)
      //DashboardController.addDailyInsoleData(1594245600000, "1234", sensorsSum,maxValues,steps, new Date().getHours());
      DashboardController.addHourInsoleData(1594245600000, 12, "1234", sensorsSum,steps, );
    });

  /*const table = data.split("\n").slice(1);
  let i = 0;
  const iMax = table.length;
  for (; i < iMax; i++) {
    const row = table[i];
    const columns = row.split(",");
    const sensor1 = columns[0];
    const sensor2 = columns[1];
    console.log(sensor1, sensor2);
  }*/
  
}
exports.removeFiles = () => {
  console.log("---------------------");
  console.log("Running Cron Job");
  fs.unlink("./error.log", (err) => {
    if (err) throw err;
    console.log("Error file successfully deleted");
  });
};


exports.saveCSVFile = ( filePath, base64CSV) => {
  fs.writeFileSync(filePath,base64CSV);
 
};
