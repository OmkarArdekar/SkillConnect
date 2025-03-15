const express = require("express");
const mysql = require("mysql2");
const router = express.Router();
const connection = require("../database/connection.js");
const ExpressError = require("../utils/ExpressError.js");

//Image Verification Route
router.get("/image/:id", (req, res, next) => {
  const { id } = req.params;
  const { table } = req.query;
  const query = `SELECT image FROM ${mysql.escapeId(table)} WHERE id = ?`;

  try {
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error fetching image:", err);
        return next(new ExpressError(500, "Error in retrieving image"));
      }

      if (results.length > 0 && results[0].image) {
        res.contentType("image/png");
        res.send(results[0].image);
      } else {
        return next(new ExpressError(404, "Image not found"));
      }
    });
  } catch (err) {
    return next(err);
  }
});

//Personal Profile Route
router.get("/:role/:id", (req, res, next) => {
  let { role, id } = req.params;
  let q = `SELECT * FROM ${mysql.escapeId(role)} WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) {
        return next(err);
      }

      const imageBuffer = result[0].image;
      const base64Image = imageBuffer ? imageBuffer.toString("base64") : null;

      const imageSrc = base64Image
        ? `data:image/png;base64,${base64Image}`
        : null;

      res.render("selfProfile.ejs", { result, imageSrc });
    });
  } catch (err) {
    return next(err);
  }
});

//Feedback Route
router.post("/:id/feedback", (req, res, next) => {
  let { id } = req.params;
  let { feedback } = req.body;
  let user = [id, req.session.user.username, feedback];
  let q = `INSERT INTO feedbacks (id, username, feedback) VALUES (?)`;
  try {
    connection.query(q, [user], (err, result) => {
      if (err) {
        return next(err);
      }
      res.redirect(`/home/${id}`);
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
