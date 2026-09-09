const User = require("../models/User");
const Resource = require("../models/Resource");
const Transaction = require("../models/Transaction");

exports.getProfile = async (req, res) => {

    try {

        const [user, resourcesShared, resourcesRequested, successfulTransactions] = await Promise.all([
            User.findById(req.user.id).select("-password"),
            Resource.countDocuments({ owner: req.user.id }),
            Transaction.countDocuments({ requester: req.user.id }),
            Transaction.countDocuments({
                $or: [{ owner: req.user.id }, { requester: req.user.id }],
                status: "Completed"
            })
        ]);

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            ...user.toObject(),
            stats: { resourcesShared, resourcesRequested, successfulTransactions }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
