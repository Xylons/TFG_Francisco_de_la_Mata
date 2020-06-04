const express = require("express");
const Profile = require("../models/profile");

const ProfileController = require("../controllers/profile");

const router = express.Router();

// Importo middleware para comprobar si los usuarios estan logeados
const checkAuth = require("../middleware/check-auth");
// Middleware para almacenar las imagenes
const extractFile = require("../middleware/file");

//Publicacion de un profile con una foto
router.post("", checkAuth, extractFile, ProfileController.createProfile);

// Editar un post
//Este se puede cambiar por app.patch
router.put("/:id", checkAuth, extractFile, ProfileController.updateProfile);

// obtener todos los post segun pagina
router.get("", checkAuth, ProfileController.getProfilesByPage);

// Obtener un solo post
router.get("/:id", checkAuth, ProfileController.getProfile);

// Borrar un post
//router.delete("/:id", checkAuth, ProfileController.deleteProfile);

module.exports = router;
