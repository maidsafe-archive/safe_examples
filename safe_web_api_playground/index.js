var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('build'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
})

let PORT = 3003;

app.listen(PORT, function() {
  console.log("Listening on port ", PORT);
})
