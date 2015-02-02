var
  ArgumentParser = require("argparse").ArgumentParser

  config = require("./config.js")
  QueueRunner = require("./lib/QueueRunner.js").QueueRunner;

module.exports.run = function(args){
  //set up argparse
  var parser = new ArgumentParser({
    description: 'USGMailer - Mailing Application for the USG'
  });

  //add possible arguments
  parser.addArgument(["--config", "-c"], {defaultValue: "config.json", help: "Path to configuration file to use. "});
  parser.addArgument(["--keep-sessions"], {action: "storeTrue", help: "Keep sessions intact. Not recommended as it may cause security gaps. "});

  (function(parser){
    parser.addArgument(["--test-config", "-t"], {action: "storeTrue", help: "Tests configuration file and then exits. "});
    parser.addArgument(["--clear-db", "-d"], {action: "storeTrue", help: "Clears the database on startup and then exits. "});
    parser.addArgument(["--grant-user", "-u"], {metavar: "USER", help: "Grants the given user access and then exits. "});
    parser.addArgument(["--grant-admin", "-a"], {metavar: "USER", help: "Grants the given user access, gives them admin privileges and then exits. "});
    parser.addArgument(["--remove-user", "-r"], {metavar: "USER", help: "removes the given user from the database and then exits. "});
  })(parser.addArgumentGroup({title: 'Startup modes'}).addMutuallyExclusiveGroup());

  //parse the arguments
  var args = parser.parseArgs(args.slice(2));

  var theQueue = new QueueRunner(args, function(e){
    console.error(e.stack);

    console.log("Error processing tasks, exiting with status 1. ");
    process.exit(1);
  }, function(){
    console.log("Done processing tasks, exiting with status 0. ");
    process.exit(0);
  });

  //load the config
  theQueue.push(module.exports.init_config);



  if(!args.test_config){
    theQueue.push(function(args, next){
      console.log("Loading components ...");

      //intialise everything else.
      theQueue.push(require("./usermodel").core.init);
      theQueue.push(require("./express").init);

      console.log("                       Done. ");

      //and next.
      next();
    });
  }

  //and run it
  theQueue.start();
}

module.exports.init_config = function(args, next){
  process.stdout.write("Loading config file '"+args.config+"' ...");

  //load the config file.
  try{
    config.load(args.config);
  } catch(e){
    console.log(" Fail. ");
    console.error(e.message);
    return process.exit(1);
  }

  console.log(" Done. ");

  //validate it
  try{

    process.stdout.write("Validating config file ...");

    var validationStatus = config.validate();

    // we validates the config file.
    if(validationStatus){
      console.log(" Done. ");
    } else if(!validationStatus){
      console.log(" Fail. ");
      return process.exit(1);
    }
  } catch(e){
    console.log(" Fail. ")
    console.error(e.message);
    return process.exit(1);
  }

  next();
}
