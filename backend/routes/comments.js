const express = require("express");
const Comment = require("../models/comment");

const CommentController = require("../controllers/comment");

const router = express.Router();

// Importo middleware para comprobar si los usuarios estan logeados
const checkAuth = require("../middleware/check-auth");
// Middleware para almacenar las imagenes
const extractFile = require("../middleware/file");

//Publicacion de un comentario
router.post("", checkAuth, CommentController.createComment);

// Editar un comentario
//Este se puede cambiar por app.patch
router.put("/:id", checkAuth, CommentController.updateComment);

// obtener todos los comentario segun pagina
router.get("", checkAuth, CommentController.getCommentsByPage);

// Obtener un solo comentario
router.get("/:id", checkAuth, CommentController.getComment);

// Borrar un comentario
router.delete("/:id", checkAuth, CommentController.deleteComment);

module.exports = router;
