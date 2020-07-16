const express = require("express");
const Post = require("../models/post");

const PostController = require("../controllers/post");

const router = express.Router();

// Importo middleware para comprobar si los usuarios estan logeados
const checkAuth = require("../middleware/check-auth");
// Middleware para almacenar las imagenes
const extractFile = require("../middleware/file");

//Publicacion de un comentario
router.post("", checkAuth, PostController.createPost);

// Editar un post
//Este se puede cambiar por app.patch
router.put("/:id", checkAuth, PostController.updatePost);

// obtener todos los post segun pagina
router.get("", checkAuth, PostController.getPostsByPage);

// Obtener un solo post
router.get("/:id", checkAuth, PostController.getPost);

// Borrar un post
router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
