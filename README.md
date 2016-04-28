#siteMonitor

Monitor a website and get notifications of important events.  Currently works with ksl.com classified ads.

[ ![Codeship Status for fohtoh/siteMonitor  -- develop branch](https://codeship.com/projects/987dc7d0-abf2-0132-4f48-46f15878b48e/status?branch=develop)](https://codeship.com/projects/68444)

###Installation

* Clone the project
* Push the app to heroku
* Add the following Addons in heroku
    * Mailgun (or signup on the mailgun website, doesn't have to be through the heroku addon)
    * MongoLab (https://mlab.com/) 
* Add the following Config Variables in heroku settings
    * MANDRILL_FROM  --> Email address you want the mail to come from
    * SERVER_URL  --> This is needed to ping the server to keep it alive and not go to sleep on heroku.     example-> http://myserver.com
    * (optional) ALLOW_SIGNUP  --> defaults to true.  If you don't want to allow any more users to sign up to use the app
    then make this false.  You will need it set to true to setup the first account.
    * MAILGUN_APIKEY --> Your mailgun api key 
    * MAILGUN_DOMAIN --> The domain where the mail will be coming from
    * MAILGUN_FROM  --> The from email address you would like the emails to be from.
    


There is code that once worked with buyvia.com but has not been maintained.  This may be fixed in the future.
But the main part was to have it work with KSL classified ads.