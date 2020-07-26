const mongoose =require('mongoose');

const insoleDaysSchema = mongoose.Schema({
    day:{type: Number, require: true},
    insoleId:{type: String, require: true, index: true},
    meanPressureData:[{ type: Number }],
    //maxPressureData:[{ type: Number }],
    steps: {type: Number, require: true},
    //Se podría guardar todos los valores en el momento maximo de presion de cada sensor 
});

module.exports = mongoose.model('InsoleDays', insoleDaysSchema);