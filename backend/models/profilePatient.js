const mongoose = require("mongoose");
const profile = require("./profile");
//Meter DNI?, timestamp?
const profilePatientSchema = profile.discriminator(
  "patient",
  new mongoose.Schema({
    bornDate: { type: Number },
    patologies: [{ type: String }],
    comments: { type: String },
    responsibles: [{ type: String }],
    insoles: [{ type: String }],
    contactPhone: { type: String, require: true },
  })
);

module.exports = mongoose.model("patient");
