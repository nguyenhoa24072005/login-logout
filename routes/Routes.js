const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

// Route cho đăng ký
router.post("/register", register);

// Route cho đăng nhập
router.post("/login", login);

module.exports = router;
