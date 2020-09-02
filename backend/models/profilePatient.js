const mongoose = require("mongoose");
const profile = require("./profile");
//Meter idPersonal?, Altura, sexo, peso, timestamp
//puntuacion Tinetti max 28 puntos
//Get Up and Go entre 1 y 5
// Mini-Mental MMS entre 0y 30
const profilePatientSchema = profile.discriminator(
  "patient",
  new mongoose.Schema({
    bornDate: { type: Number, default: 0 },
    patologies: [{ type: String, lowercase: true }],
    description: { type: String },
    responsibles: [{ type: String }],
    leftInsole:{ type: String },
    rightInsole:{ type: String },
    contactPhone: { type: String, require: true },

    personalId: {type:String, unique: true},
    height: {type: Number},
    weight: {type: Number},
    gender: {type: String},
    tinetti:{type: Number},
    getuptest:{type: Number},
    mms:{type:Number},
    timestamp:{ type : Date, default: Date.now },

  })
);

module.exports = mongoose.model("patient");
