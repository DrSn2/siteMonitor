var request = require('request');
var cheerio = require('cheerio');
var secrets = require('./config/secrets');
var Monitor = require('./models/Monitor');
var cache = require('memory-cache');

//Database Connection
var mongoose = require('mongoose');
mongoose.connect(secrets.db);
mongoose.connection.on('error', function () {
    console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});


//Set the interval in ms on how fast to check the website.
setInterval(function () {
    if (secrets.isMonitorActive == 'true') {
        getMonitorList();
        pingServer();
    }
    else console.log("monitor is not active, please turn it on.");
}, 60000);


/**
 * Checks the KSL classified page for changes to the given search criteria.
 * @param id - unique id of the listing.
 * @param website - The website Url to monitor.
 * @param to - Email address to send the notification to.
 * @param name - A name given for the search.  This is appended to the beginning of the email subject.
 */
function checkKslClassifiedPage(id, website, to, name) {
    request(website, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body),
                $body = $('body'),
                $listings = $body.find('.listing'),
                pastListings = [],
                currentListings = [];

            //load past listings from cache if available
            if (cache.get(id + '-listings')) {
                // console.log('cache listing found: ' + cache.get(id + '-listings'));
                pastListings = cache.get(id + '-listings');
            }


            //Scrape listings and store listing details in memory
            $listings.each(function (i, item) {
                if (item.attribs.class !== 'featured listing classifiedListing') {
                    var title = $(item).find('.title').text().trim();
                    var itemId = item.attribs['data-item-id'];
                    var description = $(item).find('.description-text').text().trim();
                    var price = $(item).find('.price').text().trim();
                    var timeOnSite = $(item).find('.timeOnSite').text().replace('|', '').trim();

                    currentListings.push({
                        itemId: itemId,
                        title: title,
                        description: description,
                        price: price,
                        timeOnSite: timeOnSite
                    });
                }
            });

            //Check for a price decrease
            currentListings.forEach(function (cl) {
                var pl = pastListings.filter(function (obj) {
                    return obj.itemId == cl.itemId;
                });

                if (pastListings.length > 0) {
                    if (pl[0].price.replace('$', '') > cl.price.replace('$', '')) {
                        console.log('Price drop - Sending notification');

                        var messageBody = website + "\n";
                        messageBody = messageBody + (cl.price + "(" + pl[0].price + ") - " + cl.title + "\n");
                        sendEmail(messageBody, to, name, "(KSL Listing price drop alert)");
                    }
                }
            });


            //Check to make sure we have currentListings in the results before we compare.
            if(currentListings[0] != undefined){
                //compare the top listing
                if (isLessThan5Minutes(currentListings[0].timeOnSite)) {

                    //check to see if listing is new.  If it is, send notification
                    if (isListingNew(currentListings[0].itemId, pastListings)) {
                        //send notification
                        var messageBody = website + "\n";
                        currentListings.forEach(function (l) {
                            var title = l.title;
                            var price = l.price;
                            messageBody = messageBody + (price + " - " + title + "\n");
                        });

                        sendEmail(messageBody, to, name, "(KSL Listing notification alert)");
                    }
                }
                else {
                    console.info('timeOnSite Greater than 5 minutes.  Not sending notification.');
                }
            }

            //when finished comparing pastListings to currentListings.  Replace pastListings with currentListings
            cache.del(id + '-listings');
            cache.put(id + '-listings', currentListings);
        }
    });
}


/**
 * Used to send the email message.  Setup to use mailgun as the mail provider.
 * @param body
 * @param to
 * @param name
 * @param subjectInfo
 */
function sendEmail(body, to, name, subjectInfo) {
    var mailgun = require('mailgun-js')({apiKey: secrets.mailgun.apiKey, domain: secrets.mailgun.domain});
    var subject = name + " - " + subjectInfo;

    var data = {
        from: secrets.mailgun.fromEmail,
        to: to,  //TODO - do I need to be able to pass in multiple emails like the mandrill one?
        subject: subject,
        text: body
    };

    mailgun.messages().send(data, function (err, body) {
        if (err)console.log('Error sending mailgun mail: ' + err);
        console.log(body);
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
                    if (m.url.indexOf('ksl.com') !== -1) checkKslClassifiedPage(m._id, m.url, m.to, m.name);
                    else console.info('Unknown monitor....');
                }
            })
        });
}

function pingServer() {
    if (secrets.serverURL.length > 1 && secrets.serverURL != 'http://localhost:3000') {
        request(secrets.serverURL, function (error) {
            if (error) console.log('Error pinging server');
        });
    }
    else {
        console.log('If you are on a service that needs a ping to keep the app alive, you will need to add a global variable of SERVER_URL to point to the root url of the app.');
    }
}

/**
 * Function to calculate if the listing is less than 5 minutes old.
 * @param timeOnSite
 * @returns {boolean}
 */
function isLessThan5Minutes(timeOnSite) {
    var isLessThan5Minutes = false;
    if (timeOnSite.indexOf('Sec') > -1) {
        isLessThan5Minutes = true;
    }
    if (timeOnSite.indexOf('Min') > -1) {
        var min = timeOnSite.replace('Min', '').trim();
        if (min < 6) {
            isLessThan5Minutes = true;
        }
    }
    return isLessThan5Minutes;
}


/**
 * Checks to see if the itemId was one of the past listings.  If not it is a new listing.
 * @param itemId
 * @param pastListings
 * @returns {boolean}
 */
function isListingNew(itemId, pastListings) {
    pastListings.forEach(function (past) {
        if (itemId === past.itemId) {
            return false;
        }
    });
    return true;
}
