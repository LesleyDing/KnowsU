// require packages
var express = require("express");
var app = express();
var bodyParser  = require("body-parser");
var request = require("request");
var async = require("async");
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// set view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// configuration for tone_analyzer
var tone_analyzer = new ToneAnalyzerV3({
  username: 'ef0112d2-147c-43dd-a529-48c7e4321fc6',
  password: 'MzcFJCWkobJK',
  version_date: '2016-05-19'
});

// Root route
app.get("/", function(req, res){
    res.render("home");
});

// New Route
app.get("/new", function(req, res){
  res.render("new");
});

// global tones
var first, inverse, min;

// CREATE ROUTE
app.post("/index", function(req, res){
  tone_analyzer.tone({ text: req.body.text }, function(err, tone) {
    if (err) {
      console.log(err);
      res.redirect("/new");
    }
    else {
      var data = JSON.parse(JSON.stringify(tone.document_tone.tone_categories[0].tones, null, 2));
      min = 0;
      data.forEach(function(tone){
        if (tone['score'] > min) {
          first = tone['tone_name'];
          min = tone['score'];
        }
      })
      
      var max = 1;
      data.forEach(function(tone){
        if (tone['score'] < max) {
          inverse = tone['tone_name'];
          max = tone['score'];
        }
      })
      
console.log(inverse);
      res.redirect("/index");
    }
  });
});

function getRandom() {
  return Math.floor(Math.random() * 3);
}

var query = "";
var sadness = ["sad", "upset", "broken"];
var joy = ["happy", "fun", "love"];
var anger = ["safe", "calm", "peace"];
var fear = ["dangerous", "fire", "safe"]
var disgust = ["calm", "excited", "interested"];

function getQuery() {
	if (first == "sadness")
		query = sadness[getRandom()];
	else if (first == "joy")
		query = joy[getRandom()];
	else if (first == "anger")
		query = anger[getRandom()];
	else if (first == "fear")
		query = fear[getRandom()];
	else if (first == "disgust")
		query = disgust[getRandom()];
	else
		query = joy[getRandom()];
}

// SHOW route
app.get("/index", function(req, res){
  getQuery();
  
  var url = 'https://api.spotify.com/v1/search?q=' + query  + '&type=album&offset=0&limit=6';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var parsedData = JSON.parse(body);
      var albumData = parsedData["albums"]["items"];
      
      url = "http://www.omdbapi.com/?s=" + query;
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          parsedData = JSON.parse(body);
          var movieData = parsedData["Search"]
          
          res.render("index", {first: first, score: Math.floor(min * 100), data: albumData, data2: movieData});
        }
      });
    }
  });
});

// start the server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started!");
});