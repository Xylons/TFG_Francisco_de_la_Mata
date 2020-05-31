const mongoose = require("mongoose");
const profile = require("./profile");

const profileResponsibleSchema = profile.discriminator(
  "ProfileResponsible",
  new mongoose.Schema({
    patients: [{ type: String }],
    typeOfResponsible: { type: String, require: true }
  })
);

module.exports = mongoose.model("ProfileResponsible", profileResponsibleSchema);
