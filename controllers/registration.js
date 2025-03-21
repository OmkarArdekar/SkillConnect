const { v4: uuidv4 } = require("uuid");

module.exports.register = (req, res, next) => {
  let { username, password, role } = req.body;
  let id = uuidv4();
  let user = [id, username, password];
  let table = role == "Teacher" ? "teacher" : "student";
  let q = `INSERT INTO ${table} (id, username, password) VALUES (?)`;

  try {
    req.db.query(q, [user], (err, result) => {
      if (err) {
        return next(err);
      }
      res.redirect("/html/index.html");
    });
  } catch (err) {
    return next(err);
  }
};
