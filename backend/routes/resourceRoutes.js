const express = require("express");

const {
    getResources,
    getResource,
    createResource
} = require("../controllers/resourceController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// GET ALL RESOURCES
// Login required because distance
// is calculated from logged-in user
router.get(
    "/",
    protect,
    getResources
);


// GET SINGLE RESOURCE
router.get(
    "/:id",
    protect,
    getResource
);


// ADD RESOURCE
router.post(
    "/",
    protect,
    createResource
);


module.exports = router;