const express = require("express");
const { uploadWebsite } = require("../controllers/upload.controllers");

const router = express.Router();

router.post("/upload", uploadWebsite);

module.exports = router;
