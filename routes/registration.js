const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const connection = require("../database/connection.js");

//Registration Route
router.post("/", (req, res, next) => {
  let { username, password, role } = req.body;
  let id = uuidv4();
  let user = [id, username, password];
  let table = role == "Teacher" ? "teacher" : "student";
  let q = `INSERT INTO ${table} (id, username, password) VALUES (?)`;

  try {
    connection.query(q, [user], (err, result) => {
      if (err) {
        return next(err);
      }
      res.redirect("/html/index.html");
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
