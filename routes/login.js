const express = require("express");
const router = express.Router();
const connection = require("../database/connection.js");
const ExpressError = require("../utils/ExpressError.js");

//Login Route
router.post("/", (req, res, next) => {
  let { username, password } = req.body;

  let studentQuery = `SELECT * FROM student WHERE username = ? AND password = ?`;
  let q = `SELECT * FROM teacher ORDER BY rating DESC`;
  let profiles;
  try {
    connection.query(q, (err, result) => {
      if (err) {
        return next(err);
      }
      profiles = result;
    });

    connection.query(
      studentQuery,
      [username, password],
      (err, studentResult) => {
        if (err) {
          console.log(err);
          return next(new ExpressError(500, "Error occur in DB"));
        }

        if (studentResult.length > 0) {
          req.session.user = {
            id: studentResult[0].id,
            username: studentResult[0].username,
            role: "student",
          };
          return res.render("layout.ejs", {
            id: studentResult,
            username,
            profiles,
          });
        }

        let teacherQuery = `SELECT * FROM teacher WHERE username = ? AND password = ?`;
        connection.query(
          teacherQuery,
          [username, password],
          (err, teacherResult) => {
            if (err) {
              console.log(err);
              return next(new ExpressError(500, "Error occur in DB"));
            }

            if (teacherResult.length > 0) {
              req.session.user = {
                id: teacherResult[0].id,
                username: teacherResult[0].username,
                role: "teacher",
              };
              let id = teacherResult[0].id;
              return res.render("layout.ejs", {
                id: teacherResult,
                username,
                profiles,
              });
            }

            return next(new ExpressError(400, "WRONG username or password"));
          }
        );
      }
    );
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
