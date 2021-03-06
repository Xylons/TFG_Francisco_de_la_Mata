const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const commentsRoutes = require("./routes/comments");
const profilesRoutes = require("./routes/profiles");
const userRoutes = require("./routes/user");
const dashboardRoutes = require("./routes/dashboard");

const dataRoutes = require("./routes/data");


const mongoose = require("mongoose");

const dataManager = require("./controllers/dataManager");
// libreria para plantificar tareas
const cron = require("node-cron");
/*  cron.schedule("* * * * *", function() {
                  * * * * * *
                  | | | | | |
                  | | | | | day of week
                  | | | | month
                  | | | day of month
                  | | hour
                  | minute
                  second ( optional )
*/
const app = express();

//cron.schedule("* * * * *", function() {  console.log("running a task every minute");  dataManager.readCSV();});
//tarea que se ejecuta a las 22:59 todos los dias
cron.schedule("59 23 * * *", function() {
  
});

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
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Permiso para la carpeta de imagenes
// si fuese una subcarpeta habría que hacer join e.j: app.use("/images", express.static(path.join("backend/images")));
app.use("/images", express.static("images"));
//Cabeceras para permitir acesso a nuestra API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Encoding, Accept-Encoding, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/comments", commentsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profilesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/data", dataRoutes);



module.exports = app;
