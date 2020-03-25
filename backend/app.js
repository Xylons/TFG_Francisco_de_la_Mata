const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const Post = require("./models/post");

const app = express();

mongoose
  .connect("mongodb://localhost:27017/insoleApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(() => {
    console.log("Connection to MongoDB FAILED");
  });

//mongodb+srv://Fran:D7O2YXrU8eLlRMoB@cursoweb-xpbvj.mongodb.net/test?retryWrites=true&w=majority
//Fran D7O2YXrU8eLlRMoB
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Cabeceras para permitir acesso a nuestra API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.post("/api/posts", (req, res, next) => {
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

app.get("/api/posts", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: "All fine",
      posts: documents
    });
  });
});


app.delete("/api/posts/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  });
});

module.exports = app;
