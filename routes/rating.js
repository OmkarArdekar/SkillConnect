const express = require("express");
const router = express.Router();
const connection = require("../database/connection.js");
const ExpressError = require("../utils/ExpressError.js");

//Get Rating Route
router.get("/:id", (req, res, next) => {
  let { id } = req.params;
  let q = `SELECT * FROM teacher WHERE id = ?`;
  try {
    connection.query(q, [id], (err, result) => {
      if (err) {
        console.error(err);
        return next(new ExpressError(500, "Some Error Occur in DB"));
      }
      if (result.length === 0) {
        return next(
          new ExpressError(404, "No teacher found with the given ID")
        );
      }
      res.render("rating.ejs", { id: result[0].id, user: result[0].username });
    });
  } catch (err) {
    return next(err);
  }
});

//Update Rating Route
router.post("/:id", (req, res, next) => {
  let { rate } = req.body;
  let { id } = req.params;

  let q = `SELECT * FROM teacher WHERE id = ?`;
  try {
    connection.query(q, [id], (err, result) => {
      if (err) {
        return next(err);
      }

      let rateCount = result[0].rating_count;
      let rating = result[0].rating;

      let newRating = (rating * rateCount + parseFloat(rate)) / (rateCount + 1);
      ++rateCount;

      q = `UPDATE teacher SET rating = ?, rating_count = ? WHERE id = ?`;
      connection.query(q, [newRating, rateCount, id], (err, updateResult) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/home/${id}`);
      });
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
