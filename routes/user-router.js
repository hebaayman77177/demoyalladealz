const express = require("express");
const userController = require("../controllers/user-controller");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/confirmToken", userController.confirmToken);
router.post("/resendToken", userController.resendToken);
module.exports = router;

