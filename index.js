var app = require("./src/express.js").app;

var server = app.listen(process.env.PORT || 3000, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('USG Mailer http://%s:%s', host, port); 
})
