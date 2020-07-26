const mongoose = require("mongoose");
const profile = require("./profile");

const profileResponsibleSchema = profile.discriminator(
  "responsible",
  new mongoose.Schema({
    //patients: [{ type: String }],
    typeOfResponsible: { type: String }
  })
);

module.exports = mongoose.model("responsible");
