const mongoose =require('mongoose');

const insoleGeneralInfoSchema = mongoose.Schema({
    day: {type: Number, require: true},
    insoleId:{type: String, require: true, index: true},
    meanOfSteps: {type: Number, require: true},
    minSteps: [{type: String}, {type: Number, require: true}],
    maxSteps: [ {type: String}, {type: Number, require: true}],
    meanPressure: [{type: Number, require: true}],
    maxPressureUser: [{type: String},{type: Number, require: true}],
    meanSteps: {type: Number, require: true},
});

module.exports = mongoose.model('InsoleGen', insoleGeneralInfoSchema);