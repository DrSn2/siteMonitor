var Monitor = require('../models/Monitor');


/**
 * Delete /api/delete/:monitor_id
 * Deletes a monitor with the passed in monitor_id
 * @param req
 * @param res
 */
exports.deleteMonitor = function (req, res) {
    Monitor.remove({
        _id: req.params.monitor_id
    }, function (err, monitor) {
        if (err) res.json({ message: 'Delete monitor FAILED: ' + err });
        res.json({ message: 'Deleted monitor: ' + req.params.monitor_id });
    });
};


/**
 * Toggles a monitor's status from active to disabled.
 * true is active.
 * false is disabled.
 * @param req
 * @param res
 */
exports.toggleMonitor = function (req, res) {

    //Find and update the monitor
    Monitor.findOne({
            _id: req.params.monitor_id
        }, 'isActive'
        , function (err, monitor) {
            if (err) console.log('Error finding monitor with id: ' + req.params.monitor_id);

            //Reverse the status
            var newStatus = true;
            if (monitor.isActive) newStatus = false;

            Monitor.update({
                    _id: req.params.monitor_id
                }, {isActive: newStatus},
                function (err, monitor) {
                    if (err) res.json({ message: 'Toggle monitor FAILED: ' + err });
                    res.json({ message: 'Toggled monitor: ' + req.params.monitor_id });
                });
        });
};
