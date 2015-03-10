var FS = require('fs');
var Path = require('path');

var Request = require('request');

var Publish = {};
module.exports = Publish;

Publish.run = function(args) {
  if (!args.apikey && !args.apisecret) {
    return console.log('You must specify both --apikey and --apisecret to publish');
  }
  var creds = {key: args.apikey, secret: args.apisecret};
  ['view', 'action'].forEach(function(type) {
    var typeDir = Path.join(args.directory, type + 's');
    FS.readdir(typeDir, function(err, langs) {
      if (err) throw err;
      langs.forEach(function(l) {
        var langDir = Path.join(typeDir, l);
        FS.readdir(langDir, function(err, files) {
          files.forEach(function(f) {
            var fileName = f.substring(0, f.indexOf('.'));
            FS.readFile(Path.join(langDir, f), {encoding: 'utf8'}, function(err, contents) {
              postFile(contents, {
                host: args.host,
                language: l,
                name: fileName,
                type: type
              }, creds, function(resp) {
                if (!resp.success) {
                  console.log('FAILURE while publishing ' + Path.join(langDir, f) + '\nDetails:' + JSON.stringify(resp));
                } else {
                  console.log('Published ' + Path.join(langDir, f));
                }
              });
            });
          })
        })
      })
    })
  })
  var recipeDir = Path.join(args.directory, 'recipes');
  FS.readdir(recipeDir, function(err, recipes) {
    if (err) throw err;
    recipes.forEach(function(recipe) {
      FS.readFile(Path.join(recipeDir, recipe), function(err, contents) {
        if (err) throw err;
        try {
          contents = JSON.parse(contents);
        } catch (e) {
          console.log('Recipe ' + recipe + ' contains invalid JSON:' + e.toString());
          throw e;
        }
        postRecipe(args, recipe, contents, creds, function(resp) {
          if (!resp.success) {
            console.log('FAILURE while publishing ' + Path.join(recipeDir, recipe) + '\nDetails' + JSON.stringify(resp));
          } else {
            console.log('Published recipe ' + recipe);
          }
        });
      })
    });
  })
}

var postRecipe = function(args, name, recipe, creds, callback) {
  var apiCall = args.host + '/v0/app/recipe';
  var callBody = recipe;
  Request({
    url: apiCall,
    method: 'post',
    json: true,
    body: callBody,
    headers: {
      'apikey': creds.key,
      'apisecret': creds.secret
    }
  }, function(err, resp, body) {
    if (err) throw err;
    callback(body);
  })
}

var postFile = function(contents, args, creds, callback) {
  var apiCall = args.host + '/v0/app/' + args.type;
  var callBody = {
      name: args.name,
      language: args.language,
  }
  callBody[args.type] = contents;
  Request({
    url: apiCall,
    method: 'post',
    json: true,
    body: callBody,
    headers: {
      'apikey': creds.key,
      'apisecret': creds.secret
    }
  }, function(err, resp, body) {
    if (err) throw err;
    callback(body);
  })
}

