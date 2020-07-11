const mongoose =require('mongoose');

const insoleWeeklyInfoSchema = mongoose.Schema({
    day: {type: Number, require: true},
    meanOfSteps: {type: Number, require: true},
    minSteps: [{type: String}, {type: Number, require: true}],
    maxSteps: [ {type: String}, {type: Number, require: true}],
    meanPressure: [{type: Number, require: true}],
    maxPressureUser: [{type: String},{type: Number, require: true}],

});

module.exports = mongoose.model('InsoleWeeklyInfo', insoleWeeklyInfoSchema);