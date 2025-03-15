const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");

const register = require("./routes/registration.js");
const login = require("./routes/login.js");
const home = require("./routes/home.js");
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
    saveUninitialized: false,
  })
);

let port = 8080;
app.listen(port, () => {
  console.log(`Server is listening through port number ${port}`);
});

//EntryPoint Page Route
app.get("/", (req, res) => {
  res.redirect("/html/index.html");
});

app.use("/register", register);
app.use("/home", login);
app.use("/home", home);
app.use("/home/profile", profile);
app.use("/home/rating", rating);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some Error Occur" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message });
});
