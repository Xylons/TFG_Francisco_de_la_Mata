const mongoose = require("mongoose");
const profile = require("./profile");

const profileAdminSchema = profile.discriminator(
  "ProfileAdmin",
  new mongoose.Schema({
    authorizedUsers: [{ type: String }],
  })
);

module.exports = mongoose.model("ProfileAdmin", profileAdminSchema);
