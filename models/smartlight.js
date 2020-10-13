const mongoose = require('mongoose');

module.exports = mongoose.model('smartlight', new mongoose.Schema({
    Type : String,
    id : Number,
    connectstatus : Boolean,
    actionon_off : [Boolean],
}))

