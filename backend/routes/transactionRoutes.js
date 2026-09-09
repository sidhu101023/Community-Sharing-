const express = require("express");

const {
    requestResource,
    getMyRequests,
    getResourceRequests,
    updateStatus
} = require("../controllers/transactionController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/request",
    protect,
    requestResource
);

router.get(
    "/my-requests",
    protect,
    getMyRequests
);

router.get(
    "/my-resources",
    protect,
    getResourceRequests
);

router.put(
    "/:id/status",
    protect,
    updateStatus
);

module.exports = router;