var Monitor = require('../models/Monitor');

/**
 * GET /monitor
 * Monitor page.
 */

exports.getMonitor = function (req, res) {
    Monitor.find().exec(function (err, monitors) {
        res.render('monitor', {
            title: 'Monitor',
            monitors: monitors
        });
    });
};

/**
 * POST /monitor
 */

exports.postMonitor = function (req, res) {
    console.log('posting monitor');

    var name = req.body.name;
    var email = req.body.email;
    var url = req.body.url;

    var m = new Monitor();
    m.name = name;
    m.email = email;
    m.url = url;

    m.save(function (err) {
        if (err)
//            req.flash('error', { msg: 'Error adding Monitor to db' });  //TODO add flash messages for success/failure
            console.log('Error adding Monitor to DB')

    });
    req.flash('success', { msg: 'Monitor ' + name + 'has been added!' });
    res.redirect('/monitor');
};

/**
 * Delete /monitor
 */

exports.deleteMonitor = function (req, res) {
    console.log('delete');
}