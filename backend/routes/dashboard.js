const express = require("express");
const Profile = require("../models/profile");

const InsoleDays = require("../models/insoleDays");
const InsoleHours = require("../models/insoleHours");
const InsoleGeneralDailyInfo = require("../models/insoleGeneralDailyInfo");

const ProfileController = require("../controllers/profile");

const DashboardController = require("../controllers/dashboard");

const router = express.Router();

// Importo middleware para comprobar si los usuarios estan logeados
const checkAuth = require("../middleware/check-auth");
// Middleware para almacenar las imagenes
const extractFile = require("../middleware/file");


// Obtener datos de un solo perfil
router.get("/single", checkAuth, DashboardController.getOneUserInsoleData);

// Obtener datos de un perfil por horas
router.get("/hourdata", checkAuth, DashboardController.getOneUserHourData);



// Obtener datos de dos perfiles
router.get("/compare", checkAuth, DashboardController.compareUsersInsoleData);

// Obtener los datos de todos los pacientes
router.get("/all", checkAuth, DashboardController.getAllDailyData);


module.exports = router;
