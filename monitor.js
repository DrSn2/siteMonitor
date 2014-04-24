var request = require('request');
var cheerio = require('cheerio');
var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/siteMonitor';

var buyViaCounter = 0; //used to not send as many emails.  This is only a temporary fix.  If more than 1 buyvia listing is used this will need to be refactored to allow that.

//Set the interval in ms on how fast to check the website.
setInterval(function () {
    getMonitorList();
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
                if (buyViaCounter != 0 ) buyViaCounter--;
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
    var postmark = require("postmark")(process.env.POSTMARK_API_KEY);
    var subject = name + " - " + subjectInfo;

//    console.log('body ' + body);
//    console.log('to ' + to);
//    console.log('name ' + name);
//    console.log('subjectInfo' + subjectInfo);

    postmark.send({
        "From": "jeremy@stowellzone.com",
        "To": to,
        "Subject": subject,
        "TextBody": body,
        "Tag": "big-bang"
    }, function (error) {
        if (error) {
            console.error("Unable to send via postmark: " + error.message);
            return;
        }
        console.info("Sent to postmark for delivery - " + subject);
    });

}

/**
 * Sets the listLink changes in the database for the given url.  //TODO this will need a more unique search than the url.  As there could be multiple listings per url.
 * @param id - id of listing.
 * @param listLink - top most listLink
 */
function setDatabaseValues(id, listLink) {
    mongo.Db.connect(mongoUri, function (err, db) {
        db.collection('monitoring', function (er, collection) {
            if (collection.find({ '_id': id})) {
                collection.update({'_id': id}, {$set: {'listLink': listLink}}, function (er, rs) {
                });
            } else {
                collection.insert({'_id': id, 'listLink': listLink}, {safe: true}, function (er, rs) {
                });
            }
        });
    });
}


/**
 * Query to the database to get all the different monitors to search.
 */
function getMonitorList() {
    mongo.Db.connect(mongoUri, function (err, db) {
        db.collection('monitoring', function (er, collection) {
            collection.find(function (err, cursor) {
                cursor.each(function (err, m) {
                    if (m != null) {
                        if (m.url.indexOf('ksl.com') !== -1) checkKslClassifiedPage(m._id, m.url, m.listLink, m.to, m.name);
                        else if (m.url.indexOf('buyvia.com') !== -1) checkBuyViaStock(m.url, m.to, m.name);  //TODO need to add a sleep to this so that it will not send a new email every 60 seconds.
                        else console.info('Unknown monitor....');
                    }
                })
            })
        });
    });
}
