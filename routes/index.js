const express = require("express");
const router = express.Router();
const index = require("../controllers/index.js");

//Login Route
router.post("/", index.login);

//HomePage Route
router.get("/", index.home);

//Edit Route
router.get("/:role/profile/:id/:col/edit", index.editForm);

//Update Route
router.patch("/:role/profile/:id/:col/edit", index.update);

//Edit Image Route
router.get("/:role/profile/:id/image", index.editImageForm);

//Update Image Route
router.post("/:role/profile/:id/image", index.uploadImage, index.updateImage);

//Teacher Profile
router.get("/:id", index.teacherProfile);

module.exports = router;
