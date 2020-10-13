const mongoose = require('mongoose');


module.exports = mongoose.model('motionsensor', new mongoose.Schema({
    Type : String,
    id : Number,
    connectstatus : Boolean,
    motionread : Boolean,
}))