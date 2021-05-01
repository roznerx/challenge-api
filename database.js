//Loading the sqlite3 and md5 modules

var sqlite3 = require("sqlite3").verbose(); // .verbose() is a modifier used to get extra info for debugging
var md5 = require("md5"); // creates a hash for stored passwords --> Avoids saving plain text passwords

// Definition of the SQLite database file (DBSOURCE)

const DBSOURCE = "db.sqlite";

// Initialization of the SQLite database as db --> Empty database file is created by default, if not exists

let db = new sqlite3.Database(DBSOURCE, (err) => {
  // Callback function called after initializing the database
  if (err) {
    // err parameter is null if everything runs ok
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");

    // Table creation

    // OPERATION TYPES

    db.run(`CREATE TABLE IF NOT EXISTS "OPERATIONTYPES" (
        "ID"	INTEGER NOT NULL,
        "TYPE"	TEXT NOT NULL,
        PRIMARY KEY("ID" AUTOINCREMENT)
    )`, (err) => {
      if (err) {
        console.log(err);
      } else {
        var sql = "select count(*) as count from OPERATIONTYPES";
        var params = [];
        db.all(sql, params, (err, rows) => {
          if (err) {
            console.log("Error executing select of OPERATIONTYPES", err);
            return;
          }
  
          if (rows[0].count == 0) {
            var insert = "INSERT INTO OPERATIONTYPES (TYPE) VALUES (?)";
            db.run(insert, ["Income"]);
            db.run(insert, ["Expenses"]);
          }
        });
      }
    })

    // OPERATIONS

    db.run(
      `CREATE TABLE IF NOT EXISTS "OPERATIONS" (
            "ID"	INTEGER NOT NULL,
            "CONCEPT"	TEXT NOT NULL,
            "AMMOUNT"	NUMERIC NOT NULL,
            "DATE"	INTEGER NOT NULL,
            "TYPEID"	INTEGER NOT NULL,
            PRIMARY KEY("ID" AUTOINCREMENT)
            FOREIGN KEY(typeid) REFERENCES operationtypes(id)
        );`
    );

   
  }
});

module.exports = db; // Exports db as public
