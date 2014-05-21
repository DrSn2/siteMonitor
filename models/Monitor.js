var mongoose = require('mongoose');

var monitorSchema = new mongoose.Schema({
    listLink: String,
    name: String,
    to: String,
    url: String
});

module.exports = mongoose.model('Monitor', monitorSchema);
