// Create express app
var express = require("express");
var app = express();

// Here we will import the reference to the database script

var db = require("./database.js");

// Enable JSON requests in body

// Server port --> Definition of local server port
var HTTP_PORT = 8000;

// Start server --> Web server running on HTTP_PORT
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});

// Root endpoint --> Response for root endpoint
app.get("/", (req, res, next) => {
  res.json({ message: "Ok" });
});

// Insert here other API endpoints

// GET Operation Types

app.get("/api/getOperationTypes", (req, res, next) => {
  var sql = "select ID, TYPE from OPERATIONTYPES";
  var params = [];
  var operationTypesPromise = new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  operationTypesPromise
    .then((rows) => {
      res.json({
        message: "succes",
        data: rows,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
      return;
    });
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404); // 404 = ERROR
});
