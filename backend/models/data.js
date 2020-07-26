const mongoose =require('mongoose');

const dataSchema = mongoose.Schema({
    insoleId: {type: String, require: true},
    unprocesedFiles: [{
            filename: { type: String, lowercase: true, require:true},
            date: { type: Number, require:true},
            hour: {type: Number, require:true}
            }]
});

module.exports = mongoose.model('Data', dataSchema);