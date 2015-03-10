var Path = require('path');
var FS = require('fs');
var Async = require('async');
var Request = require('request');
var Mkdirp = require('mkdirp');

var Build = {};
module.exports = Build;

Build.run = function(args) {
  build(args, {
    key: args.apikey,
    secret: args.apisecret
  }, function(resp) {
    if (!resp.success) {
      console.log('Build failed.\nDetails:' + JSON.stringify(resp));
    } else {
      writeOut(args, resp.files, function() {
        if (resp.run_command) {
          console.log('Run your app with the command:\n' + resp.run_command.replace('TARGET_DIRECTORY', args.destination));
        }
      })
    }
  })
}

var createApp = function(args, callback) {
  var app = {};
  if (args.mainAction || args.mainView) {
    app.main = {
      view: args.mainView,
      data: {
        action: args.mainAction
      }
    }
  }
  app.answers = args.answers ? JSON.parse(args.answers) : {};
  var actions = args.actions ? args.actions.split(',') : [];
  var views = args.views ? args.views.split(',') : [];
  if (args.prod) {
    app.actions = actions;
    app.views = views;
    callback(app);
  } else {
    Async.parallel([
      function(callback) {
        grabFiles(args, 'action', args.server, actions, callback);
      },
      function(callback) {
        grabFiles(args, 'view', args.client, views, callback);
      }
    ], function(err, results) {
      if (err) throw err;
      app.actions = results[0];
      app.views = results[1];
      callback(app);
    });
  }
}

var build = function(args, creds, callback) {
  var apiCall = args.host + '/v0/app/build';
  createApp(args, function(app) {
    var callBody = {
        server_language: args.server,
        client_language: args.client,
        app: app,
        include_boilerplate_files: true
    }
    Request({
      url: apiCall,
      method: 'post',
      json: true,
      body: callBody,
      headers: {
        'apikey': creds.key,
      }
    }, function(err, resp, body) {
      if (err) throw err;
      callback(body);
    })
  })
}

var DEFAULT_DIR = {
  action: 'request',
  view: 'html'
}

var grabFiles = function(args, type, language, names, callback) {
  if (!names || names.length < 1) return callback(null, {});
  var baseDir = Path.join(args.directory, type + 's', language);
  FS.readdir(baseDir, function(err, files) {
    if (err) {
      origBaseDir = baseDir;
      baseDir = Path.join(args.directory, type + 's', DEFAULT_DIR[type])
      try {
        files = FS.readdirSync(baseDir);
      } catch (e) {
        console.log(e);
        throw new Error("Could not open directory " + origBaseDir + " or " + baseDir);
      }
    }
    fileNames = {};
    files.forEach(function(file) {
      var extLoc = file.indexOf('.');
      var key = extLoc === -1 ? file : file.substring(0, extLoc);
      fileNames[key] = file;
    })
    Async.parallel(names.map(function(name) {
      if (!fileNames[name]) {
        throw new Error("File not found for " + type + " " + name + " for language " + language);
      }
      return function(callback) {
        FS.readFile(Path.join(baseDir, fileNames[name]), {encoding: 'utf8'}, function(err, contents) {
          if (err) throw err;
          callback(null, {name: name, contents: contents})
        })
      }
    }), function(err, results) {
      if (err) throw err;
      var ret = {};
      results.forEach(function(result) {
        ret[result.name] = {}
        ret[result.name][language] = result.contents
      })
      callback(null, ret);
    })
  })
}

var writeOut = function(args, files, callback) {
  var dirs = files.filter(function(f) {return f.directory});
  files = files.filter(function(f) {return !f.directory});
  Async.series([
    function(callback) {
      Async.parallel(dirs.map(function(dir) {
        return function(callback) {
          Mkdirp(Path.join(args.destination, dir.filename), function(err) {callback()});
        }
      }), callback)
    },
    function(callback) {
      Async.parallel(files.map(function(file) {
        return function(callback) {
          FS.writeFile(Path.join(args.destination, file.filename), file.contents, callback)
        }
      }), callback)
    }
  ], function(err, results) {
    if (err) throw err;
    callback();
  })
}
