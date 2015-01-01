var app = require("./src/express.js").app;
var config = require("./config.json");

var server = app.listen(process.env.PORT || config.port || 8080, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('USG Mailer http://%s:%s', host, port);
})
