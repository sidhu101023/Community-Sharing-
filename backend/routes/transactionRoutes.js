const express = require("express");

const {
    requestResource,
    getMyRequests,
    getResourceRequests,
    getActiveTransactions,
    getTransactionHistory,
    updateStatus,
    completeTransaction
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

router.get(
    "/active",
    protect,
    getActiveTransactions
);

router.get(
    "/history",
    protect,
    getTransactionHistory
);

router.put(
    "/:id/status",
    protect,
    updateStatus
);

router.put(
    "/:id/complete",
    protect,
    completeTransaction
);

module.exports = router;
