const cron = require("node-cron");
const express = require("express");
const fs = require("fs");
const csv = require("fast-csv");
const path = require("path");

const InsoleDays = require("../models/insoleDays");
const InsoleHours = require("../models/insoleHours");
const InsoleGeneralDailyInfo = require("../models/insoleGeneralDailyInfo");

const Data = require("../models/data");
const DashboardController = require("./dashboard");

const ProfileController = require("./profile");

exports.readCSV = async function getCSVdata() {
  //Lectura de ficheros pendientes
  let processedInsoles = [];
  Data.find()
    .then((allData) => {
      if (allData) {
        console.log(allData);
        for (let i = 0; i < allData.length; i++) {
          let processedDates = [];
          //Para cada plantilla proceso los archivos de cada hora
          for (let j = 0; j < allData[i].unprocesedFiles.length; j++) {
            saveDailyHourData(
              allData[i].unprocesedFiles[j],
              allData[i].insoleId
            );
            if (!processedDates.includes(allData[i].unprocesedFiles[j])) {
              processedDates.push(allData[i].unprocesedFiles[j]);
            }
          }
          processedInsoles.push({
            insoleId: allData[i].insoleId,
            dates: processedDates,
          });
          //remove allData[i].id de la base de datos
          //removeData(allData[i].id);
        }
        //proceso los datos del dia
        saveDailyData(processedInsoles);
        //proceso los datos generales
        saveTotalData(processedInsoles);
      } else {
        console.log("Data not found");
      }
    })
    .catch((error) => {
      console.log("Fetching comment failed!");
    });
};

function removeData(id) {
  Data.deleteOne({ _id: id })
    .then((result) => {
      // Si elimina algun comment
      if (result.n > 0) {
        console.log("Comment deleted!");
      }
    })
    .catch((error) => {
      console.log("Comment deletion failed!");
    });
}
async function saveDailyData(processedInsoles) {
  let emptyArray = new Array(32);
  for (let i = 0; i < this.emptyArray.length; i++) {
    this.emptyArray[i] = 0;
  }
  for (let i = 0; i < processedInsoles.length; i++) {
    for (let j = 0; j < processedInsoles[i].dates.length; j++) {
      InsoleHours.find({
        insoleId: processedInsoles[i].insoleId,
        day: processedInsoles[i].dates[j],
      })
        .then((insoleData) => {
          if (insoleData) {
            var newArray = [...emptyArray];
            var sumSteps = 0;
            for (let k = 0; k < insoleData.length; k++) {
              //sumo los valores de todos los sensores
              for (var s = 0; s < insoleData.meanPressureData.length; s++) {
                newArray[s] += parseInt(insoleData.meanPressureData[s], 10);
              }
              sumSteps += parseInt(insoleData.steps, 10);
            }

            //calculo la media de esos sensores para ese dia
            for (var m = 0; m < newArray.length; m++) {
              newArray[m] = newArray[m] / insoleData.meanPressureData.length; //don't forget to add the base
            }

            // Almaceno la entrada de datos para ese dia
            storeInsoleDay(
              processedInsoles[i].dates[j],
              processedInsoles[i].insoleId,
              newArray,
              sumSteps
            );
          } else {
            console.log("Error, no data for the selected date");
          }
        })
        .catch((error) => {
          console.log("Fetching insole data failed!" + error);
        });
    }
  }
}

async function storeInsoleDay(day, insoleId, meanPressureData, steps) {
  InsoleDays.findOne({ insoleId: id, day: day })
    .then((dataRecieved) => {
      const insoleDay = new InsoleDays();
      //si ya existe en la bd se modifica la información
      if (dataRecieved._id) {
        insoleDay = new InsoleDays({
          _id: dataRecieved._id,
          day: day,
          insoleId: insoleId,
          meanPressureData: meanPressureData,
          steps: steps,
        });

        //Si no existe se crea
      } else {
        insoleDay = new InsoleDays({
          day: day,
          insoleId: insoleId,
          meanPressureData: meanPressureData,
          steps: steps,
        });
      }

      // Almaceno los datos en Mongo
      insoleDay
        .save()
        .then((createdData) => {
          /// con ...createdComment hago una copia de el objeto creadedComment y añado el id luego
          // igual hay que poner al final _doc
          console.log(createdData);
          console.log("Data Added");
        })
        .catch((error) => {
          console.log("Creting a Data failed");
        });
    })
    .catch((error) => {
      console.log("Fetching Data failed");
    });
}
async function saveTotalData(processedInsoles) {
  //query.$or = [{ name: name }, { surname: surname }];
  let listOfProcessedInsoles = [];
  for (let i = 0; i < processedInsoles.length; i++) {
    for (let j = 0; j < processedInsoles[i].dates.length; j++) {
      ProfileController.getInsoleInfo(req.query.id)
        .then((profileData) => {
          let datediff = new Date() - new Date(profileData.bornDate);
          let age = Math.trunc(datediff / (1000 * 60 * 60 * 24 * 365));
          let leftInsole = profileData.leftInsole;
          let rightInsole = profileData.rightInsole;
          listOfProcessedInsoles.push(leftInsole);
          listOfProcessedInsoles.push(rightInsole);

          InsoleDays.find({
            insoleId: leftInsole,
            day: processedInsoles[i].dates[j],
          })
            .then((leftInsoleData) => {
              InsoleDays.find({
                insoleId: rightInsole,
                day: processedInsoles[i].dates[j],
              })
                .then((rightInsoleData) => {
                  let totalSteps = rightInsoleData.steps + leftInsoleData.steps;
                  //Busco si existe ya una entrada con los datos de ese dia
                  InsoleGeneralDailyInfo.findOne({
                    day: processedInsoles[i].dates[j],
                  })
                    .then((dataRecieved) => {
                      let values;
                      if (dataRecieved) {
                        values = {
                          _id: dataRecieved._id,
                          day: processedInsoles[i].dates[j],
                          meanOfSteps0: dataRecieved.meanOfSteps0,
                          meanOfSteps60: dataRecieved.meanOfSteps60,
                          meanOfSteps70: dataRecieved.meanOfSteps70,
                          meanOfSteps80: dataRecieved.meanOfSteps80,
                          meanOfSteps90: dataRecieved.meanOfSteps90,
                          minSteps: dataRecieved.minSteps,
                          maxSteps: dataRecieved.maxSteps,
                        };
                        //Si no existen datos previos se crean
                      } else {
                        values = {
                          day: processedInsoles[i].dates[j],
                          meanOfSteps0: 0,
                          meanOfSteps60: 0,
                          meanOfSteps70: 0,
                          meanOfSteps80: 0,
                          meanOfSteps90: 0,
                          minSteps: 0,
                          maxSteps: 0,
                        };
                      }

                      if (age >= 90) {
                        values.meanOfSteps90 =
                          (values.meanOfSteps90 + totalSteps) / 2;
                      } else if (age >= 80) {
                        values.meanOfSteps80 =
                          (values.meanOfSteps80 + totalSteps) / 2;
                      } else if (age >= 70) {
                        values.meanOfSteps70 =
                          (values.meanOfSteps70 + totalSteps) / 2;
                      } else if (age >= 60) {
                        values.meanOfSteps60 =
                          (values.meanOfSteps60 + totalSteps) / 2;
                      } else if (age <= 60) {
                        values.meanOfSteps0 =
                          (values.meanOfSteps0 + totalSteps) / 2;
                      }
                      if (values.minSteps > totalSteps) {
                        values.minSteps = totalSteps;
                      }
                      if (values.maxSteps > totalSteps) {
                        values.minSteps = totalSteps;
                      }
                      const insoleGeneralDailyInfo = new InsoleGeneralDailyInfo(
                        values
                      );

                      // Almaceno los datos en Mongo
                      insoleGeneralDailyInfo
                        .save()
                        .then((createdData) => {
                          console.log(createdData);
                          console.log("Data Added");
                        })
                        .catch((error) => {
                          console.log("Creting a Data failed");
                        });
                    })
                    .catch((error) => {
                      console.log("Error getting all data");
                    });
                })
                .catch((error) => {
                  console.log("Fetching Right Insole Data failed");
                });
            })
            .catch((error) => {
              console.log("Fetching Left Insole Data failed");
            });
        })
        .catch((error) => {
          console.log("Fetching Profile failed");
        });
    }
  }

  InsoleDays.findOne({ insoleId: id, day: day })
    .then((dataRecieved) => {
      const insoleDay = new InsoleDays();
      //si ya existe en la bd se modifica la información
      if (dataRecieved._id) {
        insoleDay = new InsoleDays({
          _id: dataRecieved._id,
          day: processedInsoles[i].dates[j],
          insoleId: processedInsoles[i].insoleId,
          meanPressureData: newArray,
          steps: sumSteps,
        });

        //Si no existe se crea
      } else {
        insoleDay = new InsoleDays({
          day: processedInsoles[i].dates[j],
          insoleId: processedInsoles[i].insoleId,
          meanPressureData: newArray,
          steps: sumSteps,
        });
      }

      // Almaceno los datos en Mongo
      insoleDay
        .save()
        .then((createdData) => {
          /// con ...createdComment hago una copia de el objeto creadedComment y añado el id luego
          // igual hay que poner al final _doc
          console.log(createdData);
          console.log("Data Added");
        })
        .catch((error) => {
          console.log("Creting a Data failed");
        });
    })
    .catch((error) => {
      console.log("Fetching Data failed");
    });

  DashboardController.addDailyInsoleData(
    1594245600000,
    "1234",
    sensorsSum,
    maxValues,
    steps,
    new Date().getHours()
  );
}

async function saveDailyHourData(fileInfo, insoleId) {
  let filename = fileInfo.filename;
  let hour = fileInfo.hour;
  let day = fileInfo.date;

  let sensorsSum = [];
  //Inicializo el array a 0
  for (i = 0; i < 32; i++) {
    sensorsSum.push(0);
  }
  let maxValues = [...sensorsSum];
  let steps = 0;
  let stepChanged = false;
  let frontSensors = 0;
  let backSensors = 0;

  console.log(
    path.resolve(__dirname + "./file-management/csv-files/" + filename)
  );
  await fs
    .createReadStream("./file-management/csv-files/" + filename)
    .pipe(csv.parse({ headers: false, delimiter: ";" }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      frontSensors = 0;
      backSensors = 0;
      //suma+= parseInt(row[0]); /*console.log(row)*/
      //tomo el valor de los 32 sensores de presión para hacer la media
      for (i = 0; i < 32; i++) {
        let parsedValue = parseInt(row[i]);
        sensorsSum[i] += parsedValue;
        if (maxValues[i] < parsedValue) {
          maxValues[i] = parsedValue;
        }
        // Los sensores de la punta son del 0-18 y talon de 23-31
        if (i < 19) {
          frontSensors += parsedValue;
        } else if (i > 22) {
          backSensors += parsedValue;
        }
        if (i === 31) {
          if (backSensors > 1000 && stepChanged === false) {
            steps++;
            stepChanged = true;
          } else if (backSensors < 700 && stepChanged === true) {
            stepChanged = false;
          }
        }
      }
    })
    .on("end", (rowCount) => {
      for (i = 0; i < 32; i++) {
        sensorsSum[i] = sensorsSum[i] / rowCount;
      }
      console.log(
        `Parsed ${rowCount} rows` +
          sensorsSum +
          "   ---------   " +
          maxValues +
          " steps " +
          steps
      );
      DashboardController.addHourInsoleData(
        day,
        hour,
        insoleId,
        sensorsSum,
        steps
      );

      //DashboardController.addDailyInsoleData(1594245600000, "1234", sensorsSum,maxValues,steps, new Date().getHours());
      //DashboardController.addHourInsoleData(1594245600000, 12, "1234", sensorsSum,steps, );
      //DashboardController.addAllInsoleData(1594418400000, 800, 600,
      //  1400, 550,750, ["patient", 200], ["patient1", 2000]);
    });
}
exports.removeFiles = () => {
  console.log("---------------------");
  console.log("Running Cron Job");
  fs.unlink("./error.log", (err) => {
    if (err) throw err;
    console.log("Error file successfully deleted");
  });
};

exports.saveCSVFile = (fileName, data, day, hour, id) => {
  let filePath = "./file-management/csv-files/" + fileName;
  try {
    Data.findOne({ insoleId: id })
      .then((dataRecieved) => {
        if (dataRecieved) {
          let newFileData = {
            filename: fileName,
            date: day,
            hour: hour,
          };
          /*let newData = {
            _id: data._id,
            insoleId: data.insoleId,
            unprocesedFiles: [],
          };*/
          let duplicate = false;
          dataRecieved.unprocesedFiles.forEach((storedData) => {
            if (storedData.filename === fileName) {
              duplicate = true;
            }
          });
          if (!duplicate) {
            const ws = fs.createWriteStream(filePath);
            csv.write(data, { headers: false, delimiter: ";" }).pipe(ws);
            Data.updateOne(
              { _id: dataRecieved._id },
              { $push: { unprocesedFiles: newFileData } }
            )
              .then((result) => {
                // Si modifica algun dato
                if (result.n > 0) {
                  console.log("Data Updated");
                  console.log(result);
                } else {
                  console.log("Error Updating Data");
                }
              })
              .catch((error) => {
                console.log("Error updating Data");
              });
          } else {
            const ws = fs.createWriteStream(filePath, { flags: "a" });
            //si los datos estan duplicados se concatena lo recibido en el csv
            csv
              .write(data, {
                headers: false,
                delimiter: ";",
                includeEndRowDelimiter: true,
              })
              .pipe(ws);
          }
        } else {
          const ws = fs.createWriteStream(filePath);
          csv.write(data, { headers: false, delimiter: ";" }).pipe(ws);
          let newData = new Data({
            insoleId: id,
            unprocesedFiles: [
              {
                filename: fileName,
                date: day,
                hour: hour,
              },
            ],
          });
          // Si no hay entrada para esa plantilla se crea
          newData
            .save()
            .then((createdData) => {
              console.log(createdData);
            })
            .catch((error) => {
              console.log("Error saving Data");
            });
        }
      })
      .catch((error) => {
        console.log("Data not found");
      });
  } catch {}
  //fs.writeFileSync(filePath,base64CSV);
};
