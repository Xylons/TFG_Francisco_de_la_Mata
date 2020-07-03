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

// Editar un perfil
//Este se puede cambiar por app.patch
router.put("/:id", checkAuth, extractFile, ProfileController.updateProfile);

// Editar un rol de usuario
router.post("/changeRol", checkAuth, ProfileController.updateRol);
// obtener todos los perfiles segun pagina
router.get("", checkAuth, ProfileController.getProfilesByPage);

// Obtener un solo perfil
router.get("/single/:id", checkAuth, ProfileController.getProfile);

// Borrar un perfil
router.delete("/:id", checkAuth, ProfileController.deleteProfile);

// Buscar perfiles del filtro
router.get("/search", checkAuth, ProfileController.filteredSearch);

module.exports = router;
