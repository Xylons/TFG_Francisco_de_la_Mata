const mongoose =require('mongoose');

const insoleSchema = mongoose.Schema({
    day:{type: Number, require: true},
    insoleId:{type: String, require: true, index: true, unique: true},
    meanPressureData:[{ type: Number }],
    maxPressureData:[{ type: Number }],
    steps: {type: Number, require: true},
    //Se podría guardar todos los valores en el momento maximo de presion de cada sensor 
});

module.exports = mongoose.model('Insole', insoleSchema);