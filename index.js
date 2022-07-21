const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + "/inference.html");
});

app.get("/1-1_003-C08.mp4", function (req, res) {
  res.sendFile(__dirname + "/1-1_003-C08.mp4");
});

app.listen(3000);
