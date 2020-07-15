const mongoose = require("mongoose");
const profile = require("./profile");
//Meter idPersonal?, Altura, sexo, peso, timestamp
const profilePatientSchema = profile.discriminator(
  "patient",
  new mongoose.Schema({
    bornDate: { type: Number },
    patologies: [{ type: String }],
    comments: { type: String },
    responsibles: [{ type: String }],
    leftInsole:{ type: String },
    rightInsole:{ type: String },
    contactPhone: { type: String, require: true },
  })
);

module.exports = mongoose.model("patient");
