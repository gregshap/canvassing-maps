var express = require('express');
var path = require('path');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/')));

app.get('/', function(req, res){
  res.sendfile('./CountiesHours.html');
});

module.exports = app;

app.listen(3000, console.log('Online 3000'));