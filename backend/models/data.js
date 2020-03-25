const mongoose =require('mongoose');

const postSchema = mongoose.Schema({
    insoleID: {type: String, require: true},
    files: {
            name: { type: String, lowercase: true},
            date: { type: Number}
          }
});

module.exports = mongoose.model('Post', postSchema);