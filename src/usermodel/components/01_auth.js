var
    ldap = require('ldapjs'),
    config = require("../../config.js").getConfig()["ldap"];

var makeQuery = function(user, pass, query, callback){

    //check if we are empty already
    if(user == "" || pass == ""){
        setTimeout(function(){callback(false); }, 0);
        return;
    }

    //create a client
    var client = ldap.createClient({
        url: config.url
    });

    //options to set
    var opts = {
        filter: query,
        scope: 'sub'
    };

    //bind (login)
    client.bind(user+config.user_suffix, pass, function (err) {

        //login error => unbind & exit
        if(err){
            client.unbind(function(err2){
                callback(false, err);
            });
            return;
        }

        //search for query
        client.search(config.dn, opts, function (err, search) {
            var res = [];

            //found someone
            search.on('searchEntry', function (entry) {
                res.push(entry.object);
            });

            //return and exit
            search.on('end', function(){
                client.unbind(function(err){
                    callback(true, res);
                });
            });
        });
    });
};

module.exports = function(usermodel){
  usermodel.auth = {};

  usermodel.auth.checkPassword = function(username, password, callback){
    makeQuery(username, password, "(sAMAccountName="+username+")", function(s, r){
        if(s){
            callback(true, r[0]["mail"].split("@")[0]);
        } else {
            callback(false, "Login failed. ");
        }
    });
  }
}
