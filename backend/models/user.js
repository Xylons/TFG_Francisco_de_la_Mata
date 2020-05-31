const mongoose = require("mongoose");
// Este paquete ayuda a controlar los valores unique
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, require: true, unique: true, uniqueCaseInsensitive: true},
  password: { type: String, require: true },
  rol: { type: String,  default: process.env.notdefined },
});

// Apply the uniqueValidator plugin to userSchema.
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
