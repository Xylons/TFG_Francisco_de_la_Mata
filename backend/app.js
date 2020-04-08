const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const postsRoutes = require("./routes/posts")
const userRoutes = require("./routes/user")


const mongoose = require("mongoose");


const app = express();

mongoose
  .connect("mongodb://localhost:27017/insoleApp", {
    useNewUrlParser: true,
    useCreateIndex: true,
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

// Permiso para la carpeta de imagenes
// si fuese una subcarpeta habría que hacer join e.j: app.use("/images", express.static(path.join("backend/images")));
app.use("/images", express.static("images"));
//Cabeceras para permitir acesso a nuestra API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
