const mongoose =require('mongoose');
// Este paquete ayuda a controlar los valores unique
const uniqueValidator= require("mongoose-unique-validator");


const userSchema = mongoose.Schema({
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true}
});

module.exports = mongoose.model('User', userSchema);