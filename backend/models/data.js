const mongoose =require('mongoose');

const datachema = mongoose.Schema({
    insoleId: {type: String, require: true},
    unprocesedFiles: {
            name: { type: String, lowercase: true},
            date: { type: Number}
          }
});

module.exports = mongoose.model('Data', dataSchema);