#siteMonitor  [ ![Codeship Status for fohtoh/siteMonitor  -- develop branch](https://codeship.com/projects/987dc7d0-abf2-0132-4f48-46f15878b48e/status?branch=develop)](https://codeship.com/projects/68444)

Monitor a website and get notifications of important events.  Currently works with ksl.com classified ads.

###Installation

* Clone the project
* Push the app to heroku
* Add the following Addons in heroku
    * Mandrill
    * MongoLab
* Add the following Config Variables in heroku settings
    * MANDRILL_FROM  --> Email address you want the mail to come from
    * SERVER_URL  --> This is needed to ping the server to keep it alive and not go to sleep on heroku.     example-> http://myserver.com
    * (optional) ALLOW_SIGNUP  --> defaults to true.  If you don't want to allow any more users to sign up to use the app
    then make this false.  You will need it set to true to setup the first account.


There is code that once worked with buyvia.com but has not been maintained.  This may be fixed in the future.
But the main part was to have it work with KSL classified ads.