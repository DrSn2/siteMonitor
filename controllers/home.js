var Monitor = require('../models/Monitor');
var m;

Monitor.find(function (err, monitors) {
    if (err)
        console.log('error');
    m = monitors;
});

//var m = new Monitor(); 		// create a new instance of the Bear model
////bear.name = req.body.name;  // set the bears name (comes from the request)
//m.name = 'My name';
//m.save(function (err) {
//    if (err)
//        console.log('error saving');
//
//
//    console.log('Monitor created!');
//});


/**
 * GET /
 * Home page.
 */

exports.index = function (req, res) {
    res.render('home', {
        title: 'Home',
        monitors: m
    });
};
