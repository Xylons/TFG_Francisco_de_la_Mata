const mongoose =require('mongoose');

const postSchema = mongoose.Schema({
    title: {type: String, require: true},
    content: {type: String, require: true},
    timestamp:{ type : Date, default: Date.now },
    creator:{type: mongoose.Schema.Types.ObjectId, ref: "User", require:true, index:true },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", require:true, index: true},
});

module.exports = mongoose.model('Post', postSchema);