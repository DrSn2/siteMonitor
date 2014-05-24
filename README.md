#siteMonitor
===========

Monitor a website and get notifications of important events.  Currently works with ksl.com.

###Installation

* Clone the project
* Push the app to heroku
* Add the following Addons in heroku
    * Mandrill
    * MongoLab
* Add the following Config Variables in heroku settings
    * MANDRILL_FROM  --> Email address you want the mail to come from
    * SERVER_URL  --> This is needed to ping the server to keep it alive and not go to sleep on heroku.


There is code that once worked with buyvia.com but has not been maintained.  This may be fixed in the future.
But the main part was to have it work with KSL classified ads.