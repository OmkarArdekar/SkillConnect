const ExpressError = require("../utils/ExpressError.js");

module.exports.login = (req, res, next) => {
  let { username, password } = req.body;

  let studentQuery = `SELECT * FROM student WHERE username = ? AND password = ?`;
  let q = `SELECT * FROM teacher ORDER BY rating DESC`;
  let profiles;
  try {
    req.db.query(q, (err, result) => {
      if (err) {
        return next(err);
      }
      profiles = result;
    });

    req.db.query(studentQuery, [username, password], (err, studentResult) => {
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
      req.db.query(teacherQuery, [username, password], (err, teacherResult) => {
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
      });
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.home = (req, res, next) => {
  let q = `SELECT * FROM teacher ORDER BY rating DESC`;
  let profiles;

  try {
    req.db.query(q, (err, result) => {
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

    req.db.query(userQuery, [userId], (err, result) => {
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
};

module.exports.editForm = (req, res) => {
  let { role, id, col } = req.params;
  res.render("edit.ejs", { role, id, col });
};

module.exports.update = (req, res, next) => {
  let { role, id, col } = req.params;
  let { newdata } = req.body;
  let q = `UPDATE ${role} SET ${col} = '${newdata}' WHERE id = '${id}'`;
  try {
    req.db.query(q, (err, result) => {
      if (err) {
        return next(err);
      }
    });
    res.redirect(`/home/profile/${role}/${id}`);
  } catch (err) {
    return next(err);
  }
};

module.exports.editImageForm = (req, res) => {
  let { role, id } = req.params;
  res.render("editImage.ejs", { id, role });
};

module.exports.updateImage = (req, res, next) => {
  let { role, id } = req.params;

  if (!req.file) {
    return res.status(400).send("No image uploaded.");
  }

  const imageData = req.file.buffer;

  let q = `UPDATE ${role} SET image = ? WHERE id = ?`;

  try {
    req.db.query(q, [imageData, id], (err, result) => {
      if (err) {
        return next(err);
      }
      res.redirect(`/home/profile/${role}/${id}`);
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.teacherProfile = (req, res, next) => {
  let { id } = req.params;
  let q = `SELECT * FROM feedbacks`;
  try {
    req.db.query(q, (err, feedbacks) => {
      q = `SELECT * FROM teacher WHERE id = '${id}'`;
      try {
        req.db.query(q, (err, result) => {
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
};
