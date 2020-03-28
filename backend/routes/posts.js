const express = require('express');
const Post = require("../models/post");
const router = express.Router();


router.post("", (req, res, next) => {
    const post = new Post({
      title: req.body.title,
      content: req.body.content
    });
    // Almaceno los datos en Mongo
    post.save().then(createdPost =>{
      res.status(201).json({
        message: "Post Added",
        postId: createdPost._id
      });
    });
   
  });
  
  //Este se puede cambiar por app.patch
  router.put("/:id",( req, res, err)=>{
    const post= new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content
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