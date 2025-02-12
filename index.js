const express = require("express");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2");
const multer = require("multer");
const session = require("express-session");
const methodOverride = require("method-override");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "skillconnect@01",
    resave: false,
    saveUninitialized: false,
  })
);

let port = 8080;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "skillconnect",
  password: "<- MySQL DataBase Password ->",
});

app.listen(port, () => {
  console.log(`Server is listening through port number ${port}`);
});

//EntryPoint Page Route
app.get("/", (req, res) => {
  res.redirect("/html/index.html");
});

//Registration Route
app.post("/register", (req, res) => {
  let { username, password, role } = req.body;
  let id = uuidv4();
  let user = [id, username, password];
  let table = role == "Teacher" ? "teacher" : "student";
  let q = `INSERT INTO ${table} (id, username, password) VALUES (?)`;

  try {
    connection.query(q, [user], (err, result) => {
      if (err) throw err;
      res.redirect("/html/index.html");
    });
  } catch (err) {
    res.send("Some error occured in DB");
  }
});

//Login Route
app.post("/home", (req, res) => {
  let { username, password } = req.body;

  let studentQuery = `SELECT * FROM student WHERE username = ? AND password = ?`;
  let q = `SELECT * FROM teacher ORDER BY rating DESC`;
  let profiles;
  connection.query(q, (err, result) => {
    profiles = result;
  });
  connection.query(studentQuery, [username, password], (err, studentResult) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error occurred during query execution.");
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
          return res.status(500).send("Error occurred during query execution.");
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

        return res.status(401).send("WRONG username or password");
      }
    );
  });
});

//HomePage Route
app.get("/home", (req, res) => {
  let q = `SELECT * FROM teacher ORDER BY rating DESC`;
  let profiles;

  connection.query(q, (err, result) => {
    if (err) {
      console.error("Error fetching teacher profiles:", err);
      return res
        .status(500)
        .send("Error occurred while fetching teacher profiles.");
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
      return res
        .status(500)
        .send("Error occurred while fetching user details.");
    }

    if (result.length === 0) {
      return res.status(404).send("User not found.");
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
});

//Image Verification Route
app.get("/home/profile/image/:id", (req, res) => {
  const { id } = req.params;
  const { table } = req.query;

  const query = `SELECT image FROM ${mysql.escapeId(table)} WHERE id = ?`;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching image:", err);
      return res.status(500).send("Error retrieving image");
    }

    if (results.length > 0 && results[0].image) {
      res.contentType("image/png");
      res.send(results[0].image);
    } else {
      res.status(404).send("Image not found");
    }
  });
});

//Personal Profile Route
app.get("/home/profile/:role/:id", (req, res) => {
  let { role, id } = req.params;
  let q = `SELECT * FROM ${mysql.escapeId(role)} WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;

      const imageBuffer = result[0].image;
      const base64Image = imageBuffer ? imageBuffer.toString("base64") : null;

      const imageSrc = base64Image
        ? `data:image/png;base64,${base64Image}`
        : null;

      res.render("selfProfile.ejs", { result, imageSrc });
    });
  } catch (err) {
    res.send("Some error in DB");
  }
});

//Edit Route
app.get("/home/:role/profile/:id/:col/edit", (req, res) => {
  let { role, id, col } = req.params;
  res.render("edit.ejs", { role, id, col });
});

//Update Route
app.patch("/home/:role/profile/:id/:col/edit", (req, res) => {
  let { role, id, col } = req.params;
  let { newdata } = req.body;
  let q = `UPDATE ${role} SET ${col} = '${newdata}' WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
    });
    res.redirect(`/home/profile/${role}/${id}`);
  } catch (err) {
    res.send("Some error in DB");
  }
});

//Edit Image Route
app.get("/home/:role/profile/:id/image", (req, res) => {
  let { role, id } = req.params;
  res.render("editImage.ejs", { id, role });
});

//Update Image Route
app.post(
  "/home/:role/profile/:id/image",
  upload.single("image"),
  (req, res) => {
    let { role, id } = req.params;

    if (!req.file) {
      return res.status(400).send("No image uploaded.");
    }

    const imageData = req.file.buffer;

    let q = `UPDATE ${role} SET image = ? WHERE id = ?`;

    try {
      connection.query(q, [imageData, id], (err, result) => {
        if (err) {
          throw err;
        }
        res.redirect(`/home/profile/${role}/${id}`);
      });
    } catch (err) {
      res.status(500).send("Error updating image");
    }
  }
);

//Teacher Profile
app.get("/home/:id", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM feedbacks`;
  try {
    connection.query(q, (err, feedbacks) => {
      q = `SELECT * FROM teacher WHERE id = '${id}'`;
      try {
        connection.query(q, (err, result) => {
          if (err) throw err;
          res.render("teacherProfiles.ejs", { result, feedbacks });
        });
      } catch (err) {
        res.send("Some error occured in DB");
      }
    });
  } catch (err) {
    res.send("Some error occured in DB");
  }
});

//Get Rating Route
app.get("/home/rating/:id", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM teacher WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error occurred in DB");
    }
    if (result.length === 0) {
      return res.send("No teacher found with the given ID");
    }
    res.render("rating.ejs", { id: result[0].id, user: result[0].username });
  });
});

//Update Rating Route
app.post("/home/rating/:id", (req, res) => {
  let { rate } = req.body;
  let { id } = req.params;

  let q = `SELECT * FROM teacher WHERE id = ?`;
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;

      let rateCount = result[0].rating_count;
      let rating = result[0].rating;

      let newRating = (rating * rateCount + parseFloat(rate)) / (rateCount + 1);
      ++rateCount;

      q = `UPDATE teacher SET rating = ?, rating_count = ? WHERE id = ?`;
      connection.query(q, [newRating, rateCount, id], (err, updateResult) => {
        if (err) throw err;
        res.redirect(`/home/${id}`);
      });
    });
  } catch (err) {
    res.send("Some error occur in DB");
  }
});

//Feedback Route
app.post("/home/profile/:id/feedback", (req, res) => {
  let { id } = req.params;
  let { feedback } = req.body;
  let user = [id, req.session.user.username, feedback];
  let q = `INSERT INTO feedbacks (id, username, feedback) VALUES (?)`;
  try {
    connection.query(q, [user], (err, result) => {
      if (err) throw err;
      res.redirect(`/home/${id}`);
    });
  } catch (err) {
    res.send("Some error occured in DB");
  }
});
