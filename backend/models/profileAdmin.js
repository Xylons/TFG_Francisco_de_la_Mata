const mongoose = require("mongoose");
const profile = require("./profile");

const profileAdminSchema = profile.discriminator(
  "admin",
  new mongoose.Schema({
    authorizedUsers: [{ type: String }],
  })
);

module.exports = mongoose.model("admin");
