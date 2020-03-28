const express = require("express");
const bodyParser = require("body-parser");

const postsRoutes = require("./routes/posts")

const mongoose = require("mongoose");


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
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
module.exports = app;
