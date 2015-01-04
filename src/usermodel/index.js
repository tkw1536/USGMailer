var usermodel = {};

require("fs").readdirSync(require("path").join(__dirname, "components")).forEach(function(file) {

  var file_name = file.substring(0, file.length - 3);
  process.stdout.write("Loading component 'usermodel/"+file_name+"' ...");

  require("./components/" + file)(usermodel);

  console.log(" Done. ");
});

module.exports = usermodel;
