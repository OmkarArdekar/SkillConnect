const express = require("express");
const router = express.Router();
const Registration = require("../controllers/registration.js");

//Registration Route
router.post("/", Registration.register);

module.exports = router;
