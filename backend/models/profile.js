const mongoose =require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const profileSchema = mongoose.Schema({
    name: {type: String, require: true, index: true },
    surname: {type: String, require: true},
    phone: {type: String, require: false},
    //tengo que cambiar por direccion dinamica
    userImagePath:{type: String, require: false, default: "http://localhost:3000/images/user.png"},
    linkedAccount:{type: mongoose.Schema.Types.ObjectId, ref: "User", require:true, unique: true},
    __t: { type: String,  default: process.env.notdefined },
});

// Apply the uniqueValidator plugin to profileSchema.
profileSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Profile', profileSchema);