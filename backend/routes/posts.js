const express = require('express');
const Post = require("../models/post");
//Multer se usa para parsear archivos
const multer= require("multer");
const router = express.Router();

/// para borrar las imagenes antiguas debo poner un worker para eliminar los archivos por la noche para no cargar las request
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};
const storage= multer.diskStorage({
  /// Destination se ejecuta cuando se intenta guardar un archivo
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let errr = new Error('Invalid mime type');
    if (isValid){
      error= null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb)=>{
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(error, name + '-' + Date.now() + '.' + ext);
  }
});

router.post("",multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");  
  const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename
    });
    // Almaceno los datos en Mongo
    post.save().then(createdPost =>{
      
      /// con ...createdPost hago una copia de el objeto creadedPost y añado el id luego
      // igual hay que poner al final _doc
      res.status(201).json({
        message: "Post Added",
        post: {
          ...createdPost,
          id: createdPost._id

        }
      });
    });
   
  });
  
  //Este se puede cambiar por app.patch
  router.put("/:id",multer({storage: storage}).single("image"),( req, res, err)=>{
    // si no tiene un archivo se extrae de imagePath
    let imagePath= req.body.imagePath;
    if(req.file){
      const url = req.protocol + '://' + req.get("host"); 
      imagePath= url + "/images/" + req.file.filename;
    }
    const post= new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
    })
    Post.updateOne({_id: req.params.id},post ).then(result => {
     
      res.status(200).json({
        message: "Post Update Sucessfull"
      });
    })
  });
  
  router.get("", (req, res, next) => {
    Post.find().then(documents => {
      res.status(200).json({
        message: "All fine",
        posts: documents
      });
    });
  });
  
  router.get("/:id", (req, res, next) => {
    Post.findById(req.params.id).then(post=>{
      if(post){
        res.status(200).json(post);
      }else{
        res.status(404).json({message:'Post not found'});
      }
    });
  });
  
  router.delete("/:id", (req, res, next) => {
    Post.deleteOne({ _id: req.params.id }).then(result => {
      console.log(result);
      res.status(200).json({ message: "Post deleted!" });
    });
  });

module.exports = router; 