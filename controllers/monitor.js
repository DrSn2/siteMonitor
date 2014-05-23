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
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('url', 'Message cannot be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/monitor');
    }

    var name = req.body.name;
    var to = req.body.email;
    var url = req.body.url;

    var m = new Monitor();
    m.name = name;
    m.to = to;
    m.url = url;

    m.save(function (err) {
        if (err) {
            console.log('Error adding Monitor to DB: ' + err)
            req.flash('errors', { msg: 'Failed to add montitor ' + err  });
            res.redirect('/monitor');
        }
        else {
            req.flash('success', { msg: 'Monitor ' + name + ' has been added!' });
            res.redirect('/monitor');
        }
    });
};
