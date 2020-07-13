const express = require("express");

const bodyParser = require("body-parser");
const dataController = require("../controllers/data");

const router = express.Router();
router.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Importo middleware para comprobar si los usuarios estan logeados
const checkAuth = require("../middleware/check-auth");
// Middleware para almacenar las imagenes
const extractFile = require("../middleware/file");

//Publicacion de un post con una foto
//Hay que anadir comprobacion de auth y de fichero
//router.post("", checkAuth, extractFile, dataController.uploadData);
router.post("", dataController.uploadData);



module.exports = router;
