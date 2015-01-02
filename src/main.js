var
  ArgumentParser = require("argparse").ArgumentParser

  config = require("./config.js")
  QueueRunner = require("./lib/QueueRunner.js").QueueRunner;

/**
* Runs the main program.
* @param args Arguments.
*/
module.exports.run = function(args){
  //set up argparse
  var parser = new ArgumentParser({
    description: 'USGMailer - Mailing Application for the USG'
  });

  //add possible arguments
  parser.addArgument(["--config", "-c"], {defaultValue: "config.json", help: "Path to configuration file to use. "});
  parser.addArgument(["--test-config", "-t"], {action: "storeTrue", help: "Test configuration file and exit. "});
  parser.addArgument(["--show-traceback", "-s"], {action: "storeTrue", help: "Show traceback when encountering major errors. "});
  parser.addArgument(["--keep-sessions"], {action: "storeTrue", help: "Keep sessions intact. Not recommended as it may cause security gaps. "});

  //parse the arguments
  var args = parser.parseArgs(args.slice(2));

  var theQueue = new QueueRunner(args, function(e){
    if(args.show_traceback){
      console.error(e.stack);
    } else {
      console.error(e);
    }

    console.log("Error processing tasks, exiting with status 1. ");
    process.exit(1);
  }, function(){
    console.log("Done processing tasks, exiting with status 0. ");
    process.exit(0);
  });

  //load the config
  theQueue.push(module.exports.init_config);

  if(!args.test_config){
    //intialise everything else.
    theQueue.push(require("./auth").init);
    theQueue.push(require("./express").init);
  }

  //and run it
  theQueue.start();
}

/**
* Loads the intial config file.
* @param args Parsed Arguments
* @param next Next thing to do.
*/
module.exports.init_config = function(args, next){
  //load the config file.
  try{
    config.load(args.config);
  } catch(e){
    console.error("Unable to load config file: "+args.config);
    console.error(e.message);
    return process.exit(1);
  }

  //validate it
  try{
    var validationStatus = config.validate();

    // we validates the config file.
    if(validationStatus){
      console.error("Validation of config file succeeded. ");
    } else if(!validationStatus){
      console.error("Validation of config file failed. ");
      return process.exit(1);
    }
  } catch(e){
    console.error("Unable to validate config file: "+args.config);
    console.error(e.message);
    return process.exit(1);
  }

  next();
}
