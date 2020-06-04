const mongoose =require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const profileSchema = mongoose.Schema({
    name: {type: String, require: true, index: true },
    surname: {type: String, require: true},
    phone: {type: String, require: false},
    userImagePath:{type: String, require: false},
    linkedAccount:{type: mongoose.Schema.Types.ObjectId, ref: "User", require:true, unique: true}
});

// Apply the uniqueValidator plugin to profileSchema.
profileSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Profile', profileSchema);