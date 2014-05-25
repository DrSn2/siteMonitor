var mongoose = require('mongoose');

var monitorSchema = new mongoose.Schema({
    listLink: String,
    name: {type: String, required: true},
    to: {type: String, required: true},
    url: {type: String, required: true},
    isActive: {type: Boolean, default: true}
});

module.exports = mongoose.model('Monitor', monitorSchema);
