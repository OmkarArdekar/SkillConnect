const express = require("express");
const router = express.Router();
const rating = require("../controllers/rating.js");

//Get Rating Route
router.get("/:id", rating.showRating);

//Update Rating Route
router.post("/:id", rating.updateRating);

module.exports = router;
