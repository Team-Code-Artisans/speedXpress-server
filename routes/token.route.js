const router = require("express").Router();
const tokenController = require("../controllers/tokenController");

router.route("/").get(tokenController.sendToken);
