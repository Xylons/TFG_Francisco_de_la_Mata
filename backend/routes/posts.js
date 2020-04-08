const express = require("express");
const Post = require("../models/post");
//Multer se usa para parsear archivos
const multer = require("multer");
const router = express.Router();

// Importo middleware para comprobar si los usuarios estan logeados
const checkAuth = require("../middleware/check-auth");

/// para borrar las imagenes antiguas debo poner un worker para eliminar los archivos por la noche para no cargar las request
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  /// Destination se ejecuta cuando se intenta guardar un archivo
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let errr = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(error, name + "-" + Date.now() + "." + ext);
  },
});

//Publicacion de un post con una foto
router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId
    });
    // Almaceno los datos en Mongo
    post.save().then((createdPost) => {
      /// con ...createdPost hago una copia de el objeto creadedPost y añado el id luego
      // igual hay que poner al final _doc
      res.status(201).json({
        message: "Post Added",
        post: {
          ...createdPost,
          id: createdPost._id,
        },
      });
    });
  }
);

// Editar un post
//Este se puede cambiar por app.patch
router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, err) => {
    // si no tiene un archivo se extrae de imagePath
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId  }, post).then((result) => {
      // Si modifica algun post
      if(result.nModified > 0){
        res.status(200).json({
          message: "Post Update Sucessfull",
        });
      }else{
        res.status(401).json({
          message: "Not authorized to edit the post",
        });
      }
     
    });
  }
);

// obtener todos los post segun pagina
router.get("", checkAuth, (req, res, next) => {
  //req.query muestra los datos que hay anadidos despues de ? y separados por &
  // + es la forma rapida de convertir en numero
  console.log(req.query);
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fechedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fechedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "All fine",
        posts: fechedPosts,
        maxPosts: count,
      });
    });
});

// Obtener un solo post
router.get("/:id", checkAuth, (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });
});

// Borrar un post
router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then((result) => {
    // Si elimina algun post
    if(result.n > 0){
      res.status(200).json({ message: "Post deleted!" });
    }else{
      res.status(401).json({ message: "No authorized to delete this post" });
    }
    
  });
});

module.exports = router;
