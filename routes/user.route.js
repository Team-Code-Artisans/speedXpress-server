const router = require("express").Router();
const userController = require("../controllers/userController");

router.route("/").get(userController.getUsers);
router.route("/:email").put(userController.addUsersTODb);

module.exports = router;
