var Monitor = require('../models/Monitor');



/**
 * Delete /
 */

exports.deleteMonitor = function (req, res) {
    res.json({ message: 'hooray! welcome to our api!'  + req.params.monitor_id });

}
