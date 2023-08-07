const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");
const placesControlers = require("../controllers/places-controller");

router.get("/:pid", placesControlers.getPlaceById);

router.get("/user/:uid", placesControlers.getPlacesByUserId);
// the middelware go from left to right and excute the parameters that way so we do validation before the controller
router.use(checkAuth);
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControlers.createPlace
);
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControlers.updatePlaceById
);
router.delete("/:pid", placesControlers.deletePlaceById);
module.exports = router;
