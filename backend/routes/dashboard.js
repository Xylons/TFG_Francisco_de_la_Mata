const express = require("express");
const Profile = require("../models/profile");

const Insole = require("../models/insole");
const InsoleDailyInfo = require("../models/insoleDailyInfo");
const InsoleWeeklyInfo = require("../models/insoleWeeklyInfo");

const ProfileController = require("../controllers/profile");

const DashboardController = require("../controllers/dashboard");

const router = express.Router();

// Importo middleware para comprobar si los usuarios estan logeados
const checkAuth = require("../middleware/check-auth");
// Middleware para almacenar las imagenes
const extractFile = require("../middleware/file");


// Obtener datos de un solo perfil
router.get("/single", checkAuth, DashboardController.getOneUserInsoleData);


module.exports = router;
