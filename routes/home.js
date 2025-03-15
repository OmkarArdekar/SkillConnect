const express = require("express");
const router = express.Router();
const connection = require("../database/connection.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ExpressError = require("../utils/ExpressError.js");

//HomePage Route
router.get("/", (req, res, next) => {
  let q = `SELECT * FROM teacher ORDER BY rating DESC`;
  let profiles;

  try {
    connection.query(q, (err, result) => {
      if (err) {
        console.error("Error fetching teacher profiles:", err);
        return next(
          new ExpressError(
            500,
            "Error occurred while fetching teacher profiles."
          )
        );
      }
      profiles = result;
    });
    let userId = req.session.user.id;
    let username = req.session.user.username;
    let role = req.session.user.role;

    let userQuery = `SELECT * FROM ${role} WHERE id = ?`;

    connection.query(userQuery, [userId], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return next(
          new ExpressError(500, "Error occurred while fetching user details")
        );
      }

      if (result.length === 0) {
        return next(new ExpressError(404, "User not found!"));
      }

      req.session.user = {
        id: result[0].id,
        username: result[0].username,
        role: result[0].role,
      };

      res.render("layout.ejs", {
        id: result,
        username: username,
        profiles: profiles,
      });
    });
  } catch (err) {
    return next(err);
  }
});

//Edit Route
router.get("/:role/profile/:id/:col/edit", (req, res) => {
  let { role, id, col } = req.params;
  res.render("edit.ejs", { role, id, col });
});

//Update Route
router.patch("/:role/profile/:id/:col/edit", (req, res, next) => {
  let { role, id, col } = req.params;
  let { newdata } = req.body;
  let q = `UPDATE ${role} SET ${col} = '${newdata}' WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) {
        return next(err);
      }
    });
    res.redirect(`/home/profile/${role}/${id}`);
  } catch (err) {
    return next(err);
  }
});

//Edit Image Route
router.get("/:role/profile/:id/image", (req, res) => {
  let { role, id } = req.params;
  res.render("editImage.ejs", { id, role });
});

//Update Image Route
router.post(
  "/:role/profile/:id/image",
  upload.single("image"),
  (req, res, next) => {
    let { role, id } = req.params;

    if (!req.file) {
      return res.status(400).send("No image uploaded.");
    }

    const imageData = req.file.buffer;

    let q = `UPDATE ${role} SET image = ? WHERE id = ?`;

    try {
      connection.query(q, [imageData, id], (err, result) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/home/profile/${role}/${id}`);
      });
    } catch (err) {
      return next(err);
    }
  }
);

//Teacher Profile
router.get("/:id", (req, res, next) => {
  let { id } = req.params;
  let q = `SELECT * FROM feedbacks`;
  try {
    connection.query(q, (err, feedbacks) => {
      q = `SELECT * FROM teacher WHERE id = '${id}'`;
      try {
        connection.query(q, (err, result) => {
          if (err) {
            return next(err);
          }
          res.render("teacherProfiles.ejs", { result, feedbacks });
        });
      } catch (err) {
        return next(err);
      }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
