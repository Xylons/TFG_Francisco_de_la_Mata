const mongoose = require("mongoose");
const profile = require("./profile");

const profilePatientSchema = profile.discriminator(
  "ProfilePatient",
  new mongoose.Schema({
    bornDate: { type: Date },
    patologies: [{ type: String }],
    comments: { type: String },
    responsibles: [{ type: String }],
    insoles: [{ type: String }],
    contactPhone: { type: String, require: true },
  })
);

module.exports = mongoose.model("ProfilePatient");
