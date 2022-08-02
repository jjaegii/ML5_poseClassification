const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/collect", function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + "/views/collect.html");
});

app.get("/train", function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + "/views/train.html");
});

app.get("/inference", function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + "/views/inference.html");
});

app.listen(3000);
