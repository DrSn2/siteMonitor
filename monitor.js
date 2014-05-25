var request = require('request');
var cheerio = require('cheerio');
var secrets = require('./config/secrets');
var Monitor = require('./models/Monitor');

//Database Connection
var mongoose = require('mongoose');
mongoose.connect(secrets.db);
mongoose.connection.on('error', function () {
    console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

var buyViaCounter = 0; //used to not send as many emails.  This is only a temporary fix.  If more than 1 buyvia listing is used this will need to be refactored to allow that.

//Set the interval in ms on how fast to check the website.
setInterval(function () {
    if (secrets.isMonitorActive) {
        getMonitorList();
        pingServer();
    }
    else console.log("monitor is not active, please turn it on.");
}, 60000);


/**
 * Checks the KSL classified page for changes to the given search criteria.
 * @param id - unique id of the listing.
 * @param website - The website Url to monitor.
 * @param listLink - The list link (a ksl term) for the top listing on the page.
 * @param to - Email address to send the notification to.
 * @param name - A name given for the search.  This is appended to the beginning of the email subject.
 */
function checkKslClassifiedPage(id, website, listLink, to, name) {
    request(website, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);

            /*Compare to see if the listings have changed.
             * If it has not changed do nothing, if it has changed send out a notification of the change
             */
            var screenListLink = $('.listlink').first().attr('href');
            var adTime = $('.adTime').first().text().trim().replace(/[^\d]/g, '');

            if (listLink == screenListLink || screenListLink == undefined || screenListLink == null) {
                console.info('.');

            } else if (parseInt(adTime) < 5) { //adTime < 5 is used to make sure old ads will not send new notifications if the top listing drops off.
                console.info('listing = ' + name);
                console.info('old listLink = ' + listLink);
                console.info('new listLink = ' + screenListLink);

                setDatabaseValues(id, screenListLink);

                var messageBody = website + "\n";
                $('.adBox').each(function () {
                    var title = $(this).find('.adTitle').text().trim();
                    var price = $(this).find('.priceBox').text().trim();
                    price = price.substring(0, price.length - 2) + "." + price.substring(price.length - 2, price.length);

                    messageBody = messageBody + (price + " - " + title + "\n");
                });

                sendEmail(messageBody, to, name, "(KSL Listing notification alert)");
            }
            else {
                console.info('AdTime Greater than 5');
                setDatabaseValues(id, screenListLink);
            }
        }
    });
}

/**
 * Checks the BuyVia website for any active stock on the given url.  It monitors the page for the text 'Buy Now'.
 * @param website - Website to monitor
 * @param to - Email address to send notifications
 * @param name - A name given for the search.  This is appended to the beginning of the email subject.
 */
function checkBuyViaStock(website, to, name) {
    request(website, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var messageBody = website + "\n" + "There is a Buy Now link available.";

            if ($('body').text().indexOf("Buy Now") !== -1 && buyViaCounter == 0) {
                sendEmail(messageBody, to, name, "(BuyVia listing notification alert)");
                buyViaCounter = 15;//Setting buyvia mute.
            }
            else {
                if (buyViaCounter != 0) buyViaCounter--;
                console.info('.');
            }
        }
    });
}

/**
 * Used to send the email message.  Currently setup to postmark addon through Heroku.
 * @param body - Email body.
 * @param to - User to send the notification to.
 * @param name - Name of the notification.
 * @param subjectInfo - Info appended to the end of the email subject.  Used to give more detail as to what the notification is for.
 */
function sendEmail(body, to, name, subjectInfo) {
    var mandrill = require('node-mandrill')(secrets.mandrill.password);
    var subject = name + " - " + subjectInfo;

    //send an e-mail to jim rubenstein
    mandrill('/messages/send', {
        message: {
            to: [
                {email: to}
            ],
            from_email: secrets.mandrill.fromEmail,
            subject: subject,
            text: body
        }
    }, function (error, response) {
        //uh oh, there was an error
        if (error) console.log(JSON.stringify(error));

        //everything's good, lets see what mandrill said
        else console.log(response);
    });


}

/**
 * Sets the listLink changes in the database for the given url.
 * @param id - id of listing.
 * @param listLink - top most listLink
 */
function setDatabaseValues(id, listLink) {
    Monitor.update({'_id': id}, { listLink: listLink}, function (err) {
        if (err) console.log('error updating document');
    });
}


/**
 * Query to the database to get all the different monitors to search and call the methods to perform the search.
 */
function getMonitorList() {
    Monitor.find()
        .where('isActive').equals(true)
        .exec(function (err, monitors) {
            monitors.forEach(function (m) {
                if (m != null) {
                    if (m.url.indexOf('ksl.com') !== -1) checkKslClassifiedPage(m._id, m.url, m.listLink, m.to, m.name);
                    else if (m.url.indexOf('buyvia.com') !== -1) checkBuyViaStock(m.url, m.to, m.name);  //TODO need to add a sleep to this so that it will not send a new email every 60 seconds.
                    else console.info('Unknown monitor....');
                }
            })
        });
}

function pingServer() {
    request(secrets.serverURL, function (error) {
        if (error) console.log('Error pinging server');
    });
}
