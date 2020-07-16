const InsoleDays = require("../models/insoleDays");
const InsoleHours = require("../models/insoleHours");
const InsoleGeneralDailyInfo = require("../models/insoleGeneralDailyInfo");

const ProfileController = require("./profile");

const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

exports.addFile = (req, res, next) => {};

exports.addHourInsoleData = (day, hour, insoleId, meanPressureData, steps) => {
  //Falta poner que si ya existe esa entrada que se actualize
  const insole = new InsoleHours({
    day: day,
    hour: hour,
    insoleId: insoleId,
    meanPressureData: meanPressureData,
    steps: steps,
  });
  // Almaceno los datos en Mongo
  insole
    .save()
    .then((createdInsole) => {
      console.log(createdInsole);
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.addDailyInsoleData = (
  day,
  insoleId,
  meanPressureData,
  maxPressureData,
  steps
) => {
  //Falta poner que revise todas las horas de ese dia, calcule la media y total de pasos
  //y lo asigne a un dia
  const insole = new InsoleDays({
    day: day,
    insoleId: insoleId,
    meanPressureData: meanPressureData,
    maxPressureData: maxPressureData,
    steps: steps,
  });
  // Almaceno los datos en Mongo
  insole
    .save()
    .then((createdInsole) => {
      console.log(createdInsole);
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.addGeneralData = (
  day,
  meanOfSteps,
  minSteps,
  maxSteps,
  meanPressure,
  maxPressureUser
) => {};

///Last week
//let date= new Date();
//date.setDate(date.getDate()-8);
//transformacion a las 00:00:00 de ese dia
//date= new Date(date.toDateString()).getTime();

exports.getOneUserInsoleData = (req, res, next) => {
  let customDay;
  let query = {};
  let range = parseInt(req.query.range);
  if (req.query.customday) {
    customDay = parseInt(req.query.customday);
  }
  let limitDay = new Date(customDay);
  //Resto los dias a la fecha indicada
  limitDay.setDate(limitDay.getDate() - range);
  //transformacion a las 00:00:00 de ese dia
  limitDay = new Date(limitDay.toDateString()).getTime();

  console.log(req.query.id);
  console.log(req.userData.userId);
  query.day = { $gte: limitDay, $lt: customDay };
  if (
    (req.userData.rol !== RESPONSIBLE && req.userData.rol !== ADMIN) ||
    (req.userData.rol === PATIENT && req.userData.userId !== req.query.id)
  ) {
    res.status(500).json({
      message: "Not authorized to that dashboard",
    });
  }

  ProfileController.getInsoleInfo(req.query.id).then((profileData) => {
    if (profileData && profileData.leftInsole && profileData.rightInsole) {
      //let insoleIds = [profileData.leftInsole, profileData.rightInsole]; { $in: insoleIds }
      //solicito los datos de plantilla izquierda y luego de la derecha
      query.insoleId = profileData.leftInsole;
      InsoleDays.find(query)
        .sort({ day: -1 })
        .then((leftInsoleData) => {
          query.insoleId = profileData.rightInsole;
          InsoleDays.find(query)
            .sort({ day: -1 })
            .then((rightInsoleData) => {
              //Aqui se puede añadir que devuelva lo ultimo que encuentre en caso de no encontrar
              if (leftInsoleData || rightInsoleData) {
                let insoleData = this.getAllUniqueDates(
                  leftInsoleData,
                  rightInsoleData,
                  "day"
                );
                res.status(200).json({
                  message: "Success",
                  insoleData: insoleData,
                  name: profileData.name,
                  surname: profileData.surname,
                });
              } else {
                res.status(400).json({
                  message: "Error, have data for the selected date",
                });
              }
            })
            .catch((error) => {
              res.status(500).json({
                message: "Fetching insole data failed!",
              });
            });
        });
    } else {
      res.status(500).json({
        message: "The user doesnt have assigned Insoles",
      });
    }
  });
};

exports.getOneUserHourData = (req, res, next) => {
  let customDay;
  let query = {};
  let day = parseInt(req.query.day);
  let leftInsoleId = req.query.leftInsoleId;
  let rightInsoleId = req.query.rightInsoleId;

  //transformacion a las 00:00:00 de ese dia
  let date = new Date(day);
  //date.setDate(date.getDate() - 1);
  day = new Date(date.toDateString()).getTime();

  if (
    (req.userData.rol !== RESPONSIBLE && req.userData.rol !== ADMIN) ||
    (req.userData.rol === PATIENT && req.userData.userId !== req.query.id)
  ) {
    res.status(500).json({
      message: "Not authorized to that dashboard",
    });
  } else {
    InsoleHours.find({ insoleId: leftInsoleId, day: day })
      .sort({ hour: -1 })
      .then((leftInsoleData) => {
        InsoleHours.find({ insoleId: rightInsoleId, day: day })
          .sort({ hour: -1 })
          .then((rightInsoleData) => {
            //Aqui se puede añadir que devuelva lo ultimo que encuentre en caso de no encontrar
            if (leftInsoleData && rightInsoleData) {
              let insoleData = this.getAllUniqueDates(
                leftInsoleData,
                rightInsoleData,
                "hour"
              );
              res.status(200).json({
                message: "Success",
                insoleData: insoleData,
              });
            } else {
              res.status(400).json({
                message: "Error, have data for the selected date",
              });
            }
          })
          .catch((error) => {
            res.status(500).json({
              message: "Fetching insole data failed!" + error,
            });
          });
      });
  }
};

exports.compareUsersInsoleData = (req, res, next) => {
  let customDay;
  let query = {};
  let range = parseInt(req.query.range);
  let patient1 = JSON.parse(req.query.patient1);
  let patient2 = JSON.parse(req.query.patient2);
  let mode= req.query.mode;
  if (req.query.customday) {
    customDay = parseInt(req.query.customday);
  }
  let limitDay = new Date(customDay);
  //Resto los dias a la fecha indicada
  limitDay.setDate(limitDay.getDate() - range);
  //transformacion a las 00:00:00 de ese dia
  limitDay = new Date(limitDay.toDateString()).getTime();
  let dayOrHour;
  let databaseModel;
  if (range === 1) {
    dayOrHour = "hour";
    databaseModel= InsoleHours;
  } else {
    dayOrHour = "day";
    databaseModel= InsoleDays;
  }
  query.day = { $gte: limitDay, $lt: customDay };
  //Info solo disponible para el responsible
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(500).json({
      message: "Not authorized to that dashboard",
    });
  }

  if (patient1 && patient2) {
    //Busco informacion del primer usuario
    query.insoleId = patient1.leftInsole;
    databaseModel.find(query)
      .sort({ day: -1 })
      .then((patient1LeftInsoleData) => {
        query.insoleId = patient1.rightInsole;
        databaseModel.find(query)
          .sort({ day: -1 })
          .then((patient1RightInsoleData) => {
            query.insoleId = patient2.leftInsole;
            databaseModel.find(query)
              .sort({ day: -1 })
              .then((patient2LeftInsoleData) => {
                query.insoleId = patient2.rightInsole;
                databaseModel.find(query)
                  .sort({ day: -1 })
                  .then((patient2RightInsoleData) => {
                    let insoleData1;
                    let insoleData2;
                    if (patient1LeftInsoleData[0] && patient1RightInsoleData[0]) {
                      insoleData1 = this.getAllUniqueDates(
                        patient1LeftInsoleData,
                        patient1RightInsoleData,
                        dayOrHour
                      );
                    }
                    if (patient2LeftInsoleData[0] && patient2RightInsoleData[0]) {
                      insoleData2 = this.getAllUniqueDates(
                        patient2LeftInsoleData,
                        patient2RightInsoleData,
                        dayOrHour
                      );
                    }
                    
                    // Si hay algún dato
                    if (insoleData1 || insoleData2) {
                      res.status(200).json({
                        message: "Success",
                        patient1: insoleData1,
                        patient2: insoleData2,
                      });
                    } else {
                      res.status(400).json({
                        message: "Error, have data for the selected date",
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      message: "Fetching insole data failed! "+ error,
                    });
                  });
              });
          });
      });
  } else {
    res.status(500).json({
      message: "The user doesnt have assigned Insoles",
    });
  }
};

exports.getAllUniqueDates = (leftInsole, rightInsole, dayOrHour) => {
  if (leftInsole && rightInsole && dayOrHour && leftInsole[0] && rightInsole[0]) {
    let daysAndStepsTemp = {};
    let leftDatesArray = [];
    let rightDatesArray = [];
    let leftMeanArray = {};
    let rightMeanArray = {};


    let leftInsoleId = leftInsole[0].insoleId;
    let rightInsoleId = rightInsole[0].insoleId;
    //Anado los datos un array indicando como indice el dia
    for (let i = 0; i < leftInsole.length; i++) {
      leftDatesArray[leftInsole[i][dayOrHour]] = leftInsole[i].steps;
      leftMeanArray[leftInsole[i][dayOrHour]] = leftInsole[i].meanPressureData;
      if (daysAndStepsTemp[leftInsole[i][dayOrHour]]) {
        daysAndStepsTemp[leftInsole[i][dayOrHour]] += leftInsole[i].steps;
      } else {
        daysAndStepsTemp[leftInsole[i][dayOrHour]] = leftInsole[i].steps;
      }
    }
    for (let i = 0; i < rightInsole.length; i++) {
      rightDatesArray[rightInsole[i][dayOrHour]] = rightInsole[i].steps;
      rightMeanArray[rightInsole[i][dayOrHour]] =
        rightInsole[i].meanPressureData;
      if (daysAndStepsTemp[rightInsole[i][dayOrHour]]) {
        daysAndStepsTemp[rightInsole[i][dayOrHour]] += rightInsole[i].steps;
      } else {
        daysAndStepsTemp[rightInsole[i][dayOrHour]] = rightInsole[i].steps;
      }
    }

    //Extraigo las fechas de las dos plantillas y descarto las repetidas con set
    let bothDates = [
      ...Object.keys(leftDatesArray),
      ...Object.keys(rightDatesArray),
    ];
    let uniqueDates = Array.from(new Set([...bothDates]));

    //leftMeanArray= Array.from(...leftMeanArray);
    //rightMeanArray= Array.from(...rightMeanArray);
    return {
      allDatesArray: uniqueDates,
      daysAndSteps: daysAndStepsTemp,
      leftInsole: { insoleId: leftInsoleId, meanByDay: leftMeanArray },
      rightInsole: { insoleId: rightInsoleId, meanByDay: rightMeanArray },
    };
  } else {
    return {
      allDatesArray: [],
      daysAndSteps: {},
      leftInsole: { insoleId: 0, meanByDay: [] },
      rightInsole: { insoleId: 0, meanByDay: [] },
    };
  }
  //    return {allDatesArray: uniqueDates, daysAndSteps: daysAndStepsTemp {day: {daysAndStepsTemp: daysAndStepsTemp, leftInsole:{id:, steps: ,mean: }, rightInsole:{steps: },}}}
};
exports.getAllUniqueHours = (leftInsole, rightInsole, dayOrHour) => {
  /*
  let daysAndStepsTemp = {};
  let leftDatesArray = [];
  let rightDatesArray = [];
  //Anado los datos un array indicando como indice el dia
  for (let i = 0; i < leftInsoleData.length; i++) {
    this.leftDatesArray[leftInsoleData[i].day] = leftInsoleData[i].steps;
    if (daysAndStepsTemp[leftInsoleData[i].day]) {
      daysAndStepsTemp[leftInsoleData[i].day] += leftInsoleData[i].steps;
    } else {
      daysAndStepsTemp[leftInsoleData[i].day] = leftInsoleData[i].steps;
    }
  }
  for (let i = 0; i < rightInsoleData.length; i++) {
    rightDatesArray[rightInsoleData[i].day] = rightInsoleData[i].steps;
    if (daysAndStepsTemp[rightInsoleData[i].day]) {
      daysAndStepsTemp[rightInsoleData[i].day] += rightInsoleData[i].steps;
    } else {
      daysAndStepsTemp[rightInsoleData[i].day] = rightInsoleData[i].steps;
    }
  }

  //Extraigo las fechas de las dos plantillas y descarto las repetidas con set
  let bothDates = [...Object.keys(leftDatesArray), ...Object.keys(rightDatesArray)];
  let uniqueDates = Array.from(new Set([...bothDates]));
  this.allDatesArray.next(uniqueDates);
  this.daysAndSteps.next(daysAndStepsTemp);
  {day: {leftInsole:{steps: ,mean:, hour: {steps:,mean:} }, rightInsole:{steps: },}}
  return 
*/
};
