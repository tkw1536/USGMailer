var
  fs = require("fs");

var config = undefined;

//Regular Expression for domain names
var domainRegEx = /^([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/;
//regular Expression for Mail usernames
var MailUserRegEx = /^[a-zA-Z0-9._%+-]+$/;

/**
* Loads a configuration file.
* @param path - Path to configuration file to load.
*/
module.exports.load = function(path){
  //load the config file.
  config = JSON.parse(fs.readFileSync(path, "utf8"));
}

/**
* Returns the current configuration file.
*/
module.exports.getConfig = function(){
  return config;
}


/**
* Validates the config file.
*/
module.exports.validate = function(){

  //check that it is an object
  if(typeof config !== "object"){
    console.error("Config File does not contain an object. ");
    return false;
  }

  //check for the port
  if(!config.hasOwnProperty("port") || ["string", "number"].indexOf(typeof config.port) == -1){
    console.error("Property 'port' must be a string or a number. ");
    return false;
  }

  //check for the mail
  if(!config.hasOwnProperty("mail") || typeof config.mail !== "string" || !domainRegEx.test(config.mail)){
    console.error("Property 'mail' must be a valid domain name. ");
    return false;
  }

  //check for default_allowed_mails
  if(!config.hasOwnProperty("default_allowed_mails") || !Array.isArray(config.default_allowed_mails)){
    console.error("Property 'default_allowed_mails' must be an array. ");
    return false;
  }

  //check the individual emails
  for(var i=0;i<config.default_allowed_mails.length;i++){
    if(!typeof config.default_allowed_mails[i] == "string" || !MailUserRegEx.test(config.default_allowed_mails[i])){
      console.error("Property 'default_allowed_mails' must be an array of valid e-mail adresses. ");
      return false;
    }
  }

  //check for the db
  if(!config.hasOwnProperty("db") || typeof config.db !== "string"){
    console.error("Property 'db' must be a string. ");
    return false;
  }

  //check the ldap
  if(!config.hasOwnProperty("ldap") || typeof config.ldap !== "object"){
    console.error("Property 'ldap' must be a string. ");
    return false;
  }

  //check ldap.url
  if(!config.ldap.hasOwnProperty("url") || typeof config.ldap.url !== "string"){
    console.error("Property 'ldap.url' must be a string. ");
    return false;
  }

  //check ldap.user_suffix
  if(!config.ldap.hasOwnProperty("user_suffix") || typeof config.ldap.user_suffix !== "string"){
    console.error("Property 'ldap.user_suffix' must be a string. ");
    return false;
  }

  //check ldap.dn
  if(!config.ldap.hasOwnProperty("dn") || typeof config.ldap.dn !== "string"){
    console.error("Property 'ldap.dn' must be a string. ");
    return false;
  }

  //we are done
  return true;
}
