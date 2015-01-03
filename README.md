# USGMailer

A really simple mailer for the USG.

TODO List:

* attachments
* actual sending

## Usage
### Setup
```
git clone https://github.com/tkw1536/USGMailer
cd USGMailer
npm install .
[sudo] npm install -g bower
bower install
#edit config.json to suit your needs
```
### Run
```
# be on-campus
node index.js
```

## What does it use?

### Server Side
* [NodeJS](http://nodejs.org/)
* [Bower](http://bower.io/)
* [MongoDB](https://github.com/mongodb/node-mongodb-native)
* [doT](http://olado.github.io/doT/)
* [Express](http://expressjs.com/)
* [Express Session](https://github.com/expressjs/session)
* [MongoDB session Store](https://github.com/kcbanner/connect-mongo)
* [Express body-parser](https://github.com/expressjs/body-parser)
* [nodemailer](http://www.nodemailer.com/)
* [html-to-js](https://www.npmjs.com/package/html-to-text)

### Client Side
* [jQuery](http://jquery.com)
* [Bootstrap](http://getbootstrap.com/)
* [bootstrap-select](https://github.com/silviomoreto/bootstrap-select)
* [bootstrap-tokenfield](http://sliptree.github.io/bootstrap-tokenfield/)
* [line-control](https://github.com/suyati/line-control)
