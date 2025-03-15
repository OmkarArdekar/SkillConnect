const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "skillconnect",
  password: "<- MySQL DataBase Password ->",
});

module.exports = connection;
