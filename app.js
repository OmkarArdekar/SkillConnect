require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");
const session = require("express-session");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DB_PASSWORD,
});

connection.connect((err) => {
  if (err) {
    console.error("Not Connected to MySQL DataBase");
    return;
  }
  console.log("Connected to MySQL DataBase");
});

const register = require("./routes/registration.js");
const index = require("./routes/index.js");
const profile = require("./routes/profile.js");
const rating = require("./routes/rating.js");

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
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  req.db = connection;
  next();
});

let port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is listening through port number ${port}`);
});

//EntryPoint Page Route
app.get("/", (req, res) => {
  res.redirect("/html/index.html");
});

app.use("/home", index);
app.use("/register", register);
app.use("/home/profile", profile);
app.use("/home/rating", rating);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some Error Occur" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message });
});
