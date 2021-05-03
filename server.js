// Create express app
var express = require("express");
var app = express();

// Here we will import the reference to the database script

var db = require("./database.js");

// Enable JSON requests in body 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// GET Operation Types [tested OK!]

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

// GET Operation [tested OK!]

app.get("/api/operation", (req, res, next) => {
  var sql = `
      SELECT
          op.id, op.concept, op.ammount, op.date, opt.id as TYPEID, opt.type
      FROM OPERATIONS op
      INNER JOIN OPERATIONTYPES opt on op.TYPEID = opt.ID
  `;

  var params = [];

  var operationPromise = new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

  operationPromise
    .then((rows) => {
      var data = [];

      rows.forEach((row) => {
        data.push({
          id: row.ID,
          concept: row.CONCEPT,
          ammount: row.AMMOUNT,
          date: row.DATE,
          operationType: {
            id: row.TYPEID,
            type: row.TYPE,
          },
        });
      });

      res.json({
        message: "success",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
      return;
    });
});

// GET Balance [tested OK!]

app.get("/api/balance", (req, res, next) => {
  var sql = `
        SELECT
            sum(case when opt.TYPE = 'Income' then op.AMMOUNT else 0 END) as SUM_INCOME,
            sum(case when opt.TYPE = 'Expenses' then op.AMMOUNT else 0 END) as SUM_EXPENSES
        FROM OPERATIONS op
        INNER JOIN OPERATIONTYPES opt on op.TYPEID = opt.ID
    `;
  var params = [];

  // REPLACED SUM_OUTCOME AS SUM_EXPENSES

  var balancePromise = new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

  balancePromise
    .then((row) => {
      var data = {
        sum_income: row.SUM_INCOME,
        sum_expenses: row.SUM_EXPENSES,
      };

      res.json({
        message: "success",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
      return;
    });
});

// GET Home (LIMIT: 10) [tested OK!]

app.get("/api/home", (req, res, next) => {
  var sql = `
  SELECT
      op.id, op.concept, op.ammount, op.date, opt.id as TYPEID, opt.type
  FROM OPERATIONS op
  INNER JOIN OPERATIONTYPES opt on op.TYPEID = opt.ID
  ORDER BY op.id desc
  LIMIT 10
`;

  var params = [];

  var homePromise = new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

  homePromise
    .then((rows) => {
      var data = [];

      rows.forEach((r) => {
        data.push({
          id: r.ID,
          concept: r.CONCEPT,
          ammount: r.AMMOUNT,
          date: r.DATE,
          operationType: {
            id: r.TYPEID,
            type: r.TYPE,
          },
        });
      });

      res.json({
        message: "success",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
      return;
    });
});


// POST Operation [tested OK!]

app.post("/api/operation", (req, res, next) => {
  var errors = [];

  if (!req.body.concept) {
    errors.push("Error, no concept specified.");
  }

  if (!req.body.typeid) {
    errors.push("Error, no operation type specified.");
  }

  if (!req.body.date) {
    errors.push("Error, no date specified.");
  }

  if (!req.body.ammount) {
    errors.push("Error, no ammount specified.");
  }

  if (errors.length > 0) {
    res.status(400).json({ error: errors });
    return;
  }

  var data = {
    concept: req.body.concept,
    ammount: req.body.ammount,
    date: req.body.date,
    typeid: req.body.typeid,
  };

  var sql =
    "INSERT INTO OPERATIONS (concept, ammount, date, typeid) VALUES (?,?,?,?)"; // Values (?,?,?,?) are replaced by params below!
  var params = [data.concept, data.ammount, data.date, data.typeid];

  var operationPromise = new Promise((resolve, reject) => {
    db.run(sql, params, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  operationPromise
    .then((result) => {
      res.json({
        message: "success",
        result: result,
        data: data,
        id: this.lastID,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
      return;
    });
});

// PUT Operation [tested OK!]

app.put("/api/operation", async (req, res, next) => {
  let operation = {};
  var sql = `
      SELECT
          op.id, op.concept, op.ammount, op.date, op.typeid
      FROM OPERATIONS op
      WHERE op.id = ?
  `;

  // WHERE op.id = ? --> Espera un parameter!

  var errors = [];

  if (!req.body.id) {
    errors.push("Error, no ID specified");
  }

  if (!req.body.concept) {
    errors.push("Error, no concept specified.");
  }

  if (!req.body.date) {
    errors.push("Error, no date specified.");
  }

  if (!req.body.ammount) {
    errors.push("Error, no ammount specified.");
  }

  if (!req.body.typeid) {
    errors.push("Error, no typeid specified.");
  }

  var operationPromise = new Promise((resolve, reject) => {
    db.get(sql, req.body.id, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

  operationPromise
    .then((row) => {
      operation = row;

      if (operation.TYPEID !== req.body.typeid)
        errors.push("Operation type cannot be modified");

      if (errors.length > 0) {
        res.status(400).json({ error: errors });
        return;
      }

      var data = {
        id: req.body.id,
        concept: req.body.concept,
        ammount: req.body.ammount,
        date: req.body.date,
      };

      sql =
        "UPDATE OPERATIONS SET concept = ?, ammount = ?, date = ? WHERE id = ?";
      var params = [data.concept, data.ammount, data.date, data.id];
      db.run(sql, params, (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        res.json({
          message: "success",
          data: data,
          id: this.lastID,
        });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
      return;
    });
});

// DELETE Operation [tested OK!]

app.delete("/api/operation", (req, res, next) => {
  if (!req.body.id) {
    res.status(400).json({ error: "Missing Operation ID" });
    return;
  }

  var deletePromise = new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM OPERATIONS WHERE id = ?",
      req.body.id,
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });

  deletePromise
    .then((result) => {
      res.json({
        message: "deleted",
        changes: this.changes,
        result: result,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
      return;
    });
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404); // 404 = ERROR
});
