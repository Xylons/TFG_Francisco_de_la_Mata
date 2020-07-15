const Insole = require("../models/insole");
const InsoleDailyInfo = require("../models/insoleDailyInfo");
const InsoleWeeklyInfo = require("../models/insoleWeeklyInfo");
const ProfileController = require("./profile");

const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

exports.addFile = (req, res, next) => {};

exports.addInsoleData = (
  day,
  insoleId,
  meanPressureData,
  maxPressureData,
  steps
) => {
  const insole = new Insole({
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

exports.addDailyData = (
  day,
  meanOfSteps,
  minSteps,
  maxSteps,
  meanPressure,
  maxPressureUser
) => {};
exports.addWeeklyData = (
  day,
  meanOfSteps,
  minSteps,
  maxSteps,
  meanPressure,
  maxPressureUser
) => {};

//hay que poner para que devuelva intervalos de tiempo
//Datos en epoch
//let actualDate = new Date();
//let epochAge = actualDate.setFullYear(actualDate.getFullYear() - age);

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
      Insole.find(query)
        .sort({ day: -1 })
        .then((leftInsoleData) => {
          query.insoleId = profileData.rightInsole;
          Insole.find(query)
            .sort({ day: -1 })
            .then((rightInsoleData) => {
              //Aqui se puede añadir que devuelva lo ultimo que encuentre en caso de no encontrar
              if (leftInsoleData || rightInsoleData) {
                res.status(200).json({
                  message: "Success",
                  leftInsole: leftInsoleData,
                  rightInsole: rightInsoleData,
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

exports.compareUsersInsoleData = (req, res, next) => {
  let customDay;
  let query = {};
  let range = parseInt(req.query.range);
  let patient1 = JSON.parse(req.query.patient1);
  let patient2 = JSON.parse(req.query.patient2);
  if (req.query.customday) {
    customDay = parseInt(req.query.customday);
  }
  let limitDay = new Date(customDay);
  //Resto los dias a la fecha indicada
  limitDay.setDate(limitDay.getDate() - range);
  //transformacion a las 00:00:00 de ese dia
  limitDay = new Date(limitDay.toDateString()).getTime();

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
    Insole.find(query)
      .sort({ day: -1 })
      .then((patient1LeftInsoleData) => {
        query.insoleId = patient1.rightInsole;
        Insole.find(query)
          .sort({ day: -1 })
          .then((patient1RightInsoleData) => {
            query.insoleId = patient2.leftInsole;
            Insole.find(query)
              .sort({ day: -1 })
              .then((patient2LeftInsoleData) => {
                query.insoleId = patient2.rightInsole;
                Insole.find(query)
                  .sort({ day: -1 })
                  .then((patient2RightInsoleData) => {
                    let patient1Insoles= {leftInsole: patient1LeftInsoleData, rightInsole: patient1RightInsoleData};
                    let patient2Insoles= {leftInsole: patient2LeftInsoleData, rightInsole: patient2RightInsoleData};
                    // Si hay algún dato
                    if (patient1Insoles || patient2Insoles) {
                      res.status(200).json({
                        message: "Success",
                        patient1: patient1Insoles,
                        patient2: patient2Insoles
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
          });
      });
  } else {
    res.status(500).json({
      message: "The user doesnt have assigned Insoles",
    });
  }
};
