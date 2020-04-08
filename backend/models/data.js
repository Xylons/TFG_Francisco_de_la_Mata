const mongoose =require('mongoose');

const datachema = mongoose.Schema({
    insoleID: {type: String, require: true},
    files: {
            name: { type: String, lowercase: true},
            date: { type: Number}
          }
});

module.exports = mongoose.model('Data', dataSchema);