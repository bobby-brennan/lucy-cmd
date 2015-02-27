var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.redirect('search_images');
})

app.all('/search_images', function(req, res) {
  if (!req.body) req.body = {};
  request.get({
    url: "https://api.gettyimages.com/v3/search/images",
    qs: {
      'page_size': 10
    },
    headers: {
      'Api-Key': "jffpb83bhunc75qk2mjpsgrj"
    },
  }, function(err, response, body) {
    body = JSON.parse(body);
    res.render('image_search', {request: req.body, result: body})
  })

});

app.listen(process.env.PORT || 3333);