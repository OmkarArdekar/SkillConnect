const express = require("express");
const router = express.Router();
const profile = require("../controllers/profile.js");

//Image Verification Route
router.get("/image/:id", profile.verifyImage);

//Personal Profile Route
router.get("/:role/:id", profile.personalProfile);

//Feedback Route
router.post("/:id/feedback", profile.feedback);

module.exports = router;
