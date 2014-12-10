var
    express = require("express"),
    session = require("express-session"),
    bodyParser = require('body-parser'),
    path = require("path");

var app = express();

app.use(session({
    secret: "idontcare",
    resave: false,
    saveUninitialized: true
}))

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        //not authorised to view this page
        res.redirect('/login');
        res.end();
    } else {
        next();
    }
}

// LOGIN ROUTE
app.get("/login", function(req, res){
    res.sendFile(path.join(__dirname, "..", "static", "login.html"));
});

app.post('/login', function (req, res) {
    var post = req.body;
    try{
        if (post.user === 'john' && post.password === 'johnspassword') {
            req.session.user_id = "secret";
            res.redirect('/');
        } else {
            throw new Error("InternalError");
        }

    } catch(e){
        res
        .sendFile(path.join(__dirname, "..", "static", "fail.html"));
    }
});

// LOGOUT ROUTE

app.get('/logout', function(req, res) {
    delete req.session.user_id;
    res.sendFile(path.join(__dirname, "..", "static", "logout.html"));
});

// LIB ROUTE

app.use("/lib", express.static(path.join(__dirname, "..", "bower_components")));
app.use("/lib", express.static(path.join(__dirname, "..", "lib")));

//AND THIS IS IT
app.get('/', checkAuth, function (req, res) {
    
});


module.exports.app = app;
