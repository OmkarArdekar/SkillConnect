const bcrypt = require("bcrypt");
const saltRounds = 10;
const ExpressError = require("../utils/ExpressError.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
const maxSize = 2 * 1024 * 1024; //2MB
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG, JPG, JPEG and GIF files are allowed!"), false);
    }
  },
});

module.exports.login = async (req, res, next) => {
  let { username, password } = req.body;

  let studentQuery = `SELECT * FROM student WHERE username = ?`;
  let q = `SELECT * FROM teacher ORDER BY rating DESC`;
  let profiles;
  try {
    req.db.query(q, (err, result) => {
      if (err) {
        return next(err);
      }
      profiles = result;
    });

    req.db.query(studentQuery, [username], async (err, studentResult) => {
      if (err) {
        console.log(err);
        return next(new ExpressError(500, "Error occur in DB"));
      }

      if (studentResult.length > 0) {
        const isMatch = await bcrypt.compare(
          password,
          studentResult[0].password
        );
        if (isMatch) {
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
      }

      let teacherQuery = `SELECT * FROM teacher WHERE username = ?`;
      req.db.query(teacherQuery, [username], async (err, teacherResult) => {
        if (err) {
          console.log(err);
          return next(new ExpressError(500, "Error occur in DB"));
        }

        if (teacherResult.length > 0) {
          const isMatch = await bcrypt.compare(
            password,
            teacherResult[0].password
          );
          if (isMatch) {
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

module.exports.uploadImage = upload.single("image");

module.exports.updateImage = (req, res, next) => {
  let { role, id } = req.params;

  if (!req.file) {
    return next(new ExpressError(400, "No image uploaded"));
  }

  const imageData = req.file.buffer;
  const imageType = req.file.mimetype;

  if (!allowedTypes.includes(imageType)) {
    return next(
      new ExpressError(
        400,
        "Invalid image type! Only PNG, JPG, JPEG and GIF are allowed."
      )
    );
  }

  if (req.file.size > maxSize) {
    return res.status(400).send("File size exceeds the 2MB limit!");
  }

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
