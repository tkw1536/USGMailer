module.exports = function(usermodel){
  usermodel.auth = {};

  usermodel.auth.checkPassword = function(username, password, callback){
    //TODO: Implement LDAP authorisation here

    //normalise username + password
    var username = username.toLowerCase().trim();
    var password = password;

    //check for password
    var success = (username == "jack" && password == "password") || (username == "john" && password == "password");

    if(success){
      callback(true, username);
    } else {
      callback(false, "Could not authorise credentials. ");
    }
  }
}
