const express = require("express");
const EmailController = require("../controllers/email");

const router = express.Router();
const controller = new EmailController();

router.post("/api/find-email", controller.findEmail);
router.post("/api/submit-email", controller.submitEmail);

module.exports = router;
