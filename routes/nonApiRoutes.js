// routes/nonApiRoutes.js
const express = require("express");
const userController = require('../controllers/UserController');
const router = express.Router();

//login Page
router.get('/', userController.getLoginView);

module.exports = router;
