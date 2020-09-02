const mongoose =require('mongoose');

const insoleGeneralInfoSchema = mongoose.Schema({
    day: {type: Number, require: true},
    //insoleId:{type: String, require: true, index: true},
    meanOfSteps0: {type: Number, require: true},
    meanOfSteps60: {type: Number, require: true},
    meanOfSteps70: {type: Number, require: true},
    meanOfSteps80: {type: Number, require: true},
    meanOfSteps90: {type: Number, require: true},
    minSteps: [{type: String}, {type: Number, require: true}],
    maxSteps: [ {type: String}, {type: Number, require: true}],
  
});

module.exports = mongoose.model('InsoleGeneralDailyInfo', insoleGeneralInfoSchema);