var Monitor = require('../models/Monitor');


/**
 * Delete /
 */

exports.deleteMonitor = function (req, res) {

    Monitor.remove({
        _id: req.params.monitor_id
    }, function (err, monitor){
        if (err) res.json({ message: 'Delete monitor FAILED: ' + err });
        res.json({ message: 'Deleted monitor: ' + req.params.monitor_id });
    });
};
