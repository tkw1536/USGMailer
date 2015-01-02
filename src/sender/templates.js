var
    fs = require("fs"),
    path = require("path");

var basePath = path.join(__dirname, "..", "..", "templates");

module.exports.getAll = function(){
    var files = fs.readdirSync(basePath);
    var avs = [];
    var res = undefined;

    for(i = 0;i<files.length;i++){
        file = files[i];
        if (file[0] !== '.') {
            filePath = "" + basePath + "/" + file;
            stat = fs.statSync(filePath);
            if(stat.isDirectory()){
                res = module.exports.getTemplateIfAvailable(file);
                res.meta.title = file;
                if(res !== false){
                    avs.push(res);
                }
            }
        }
    }

    return avs;
}

module.exports.getTemplateIfAvailable = function(name){
    var baseFolder = path.join(basePath, name);

    var metaPath = path.join(baseFolder, "meta.json");
    var htmlPath = path.join(baseFolder, "content.html");
    var txtPath = path.join(baseFolder, "content.txt");

    try{
        var meta = require(metaPath);
    } catch(e){
        return false;
    }

    var html = false;

    if(meta.html){
        try{
            html = module.exports.render(fs.readFileSync(htmlPath).toString());
        } catch(e){
            console.log("Unable to read content file: "+htmlPath)
        }
    }

    if(meta.text){
        try{
            text = module.exports.render(fs.readFileSync(txtPath).toString());
        } catch(e){
            console.log("Unable to read content file: "+txtPath)
        }
    }

    return {
        "meta": meta,
        "html": html,
        "text": text
    };
}

module.exports.render = function(string){

    var string = string;

    return function(vars){
        var string_local = string.toString();

        for(var key in vars){
            if(vars.hasOwnProperty(key)){
                string_local = string_local.replace("{{"+key+"}}", vars[key]);
            }
        }

        return string_local;
    }
}
