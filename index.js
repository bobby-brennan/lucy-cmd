#! /usr/bin/env node
var Path = require('path');
var Mkdirp = require('mkdirp');
var args = require('yargs').argv;

var command = args["_"][0];

args.host = args.host || 'https://api.lucybot.com',
args.directory = args.directory || process.cwd();
if (command === 'build') {
  if (!args.server || !args.client) {
    throw new Error("You must specify both --client and --server languages")
  }
  if (!args.destination) {
    args.destination = Path.join(process.cwd(), 'build', args.server, args.client);
    Mkdirp.sync(args.destination);
  }
  if (!args.views) {
    throw new Error("You must specify at least one view in --views")
  }
}
if (!args.apikey) {
  throw new Error('You must specify your --apikey');
}


if (command === 'build') {
  require('./src/build.js').run(args);
} else if (command === 'publish') {
  require('./src/publish.js').run(args);
} else {
  console.log('Unknown command: ' + command);
}
