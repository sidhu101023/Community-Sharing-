const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Resource = require("../models/Resource");
const User = require("../models/User");

const RESOURCE_FIELDS = "name category description condition image availability status location";
const PERSON_FIELDS = "name profileImage location";
const PRIVATE_PERSON_FIELDS = "name email phone profileImage location";

function isParticipant(transaction, userId) {
    const ownerId = transaction.owner?._id || transaction.owner;
    const requesterId = transaction.requester?._id || transaction.requester;
    return String(ownerId) === String(userId) || String(requesterId) === String(userId);
}

function isValidId(value) {
    return mongoose.Types.ObjectId.isValid(value);
}

function baseTransactionQuery(query) {
    return query
        .populate("resource", RESOURCE_FIELDS)
        .populate("owner", PERSON_FIELDS)
        .populate("requester", PERSON_FIELDS)
        .sort({ createdAt: -1 });
}

async function serializeTransaction(transaction, userId, includeContacts = false) {
    const object = transaction.toObject ? transaction.toObject() : transaction;
    const participant = isParticipant(object, userId);

    if (includeContacts && participant && object.status === "Approved") {
        const people = await User.find({
            _id: { $in: [object.owner?._id || object.owner, object.requester?._id || object.requester] }
        }).select(PRIVATE_PERSON_FIELDS).lean();
        const peopleById = new Map(people.map(person => [String(person._id), person]));
        object.owner = peopleById.get(String(object.owner?._id || object.owner)) || object.owner;
        object.requester = peopleById.get(String(object.requester?._id || object.requester)) || object.requester;
    }

    return object;
}

async function getTransactions(filter, userId, includeContacts = false) {
    const transactions = await baseTransactionQuery(Transaction.find(filter));
    return Promise.all(transactions.map(transaction => serializeTransaction(transaction, userId, includeContacts)));
}

exports.requestResource = async (req, res) => {
    try {
        const { resourceId } = req.body;
        if (!isValidId(resourceId)) return res.status(404).json({ message: "Resource not found." });

        const resource = await Resource.findById(resourceId).select("owner availability status");
        if (!resource) return res.status(404).json({ message: "Resource not found." });
        if (String(resource.owner) === String(req.user.id)) {
            return res.status(403).json({ message: "You cannot request your own resource." });
        }
        if (resource.availability !== "Available" || resource.status === "Unavailable") {
            return res.status(400).json({ message: "This resource is currently unavailable." });
        }

        const existing = await Transaction.findOne({
            resource: resource._id,
            requester: req.user.id,
            status: { $in: ["Pending", "Approved"] }
        });
        if (existing) {
            return res.status(400).json({
                message: existing.status === "Pending"
                    ? "You already have a pending request for this resource."
                    : "You already have an active transaction for this resource."
            });
        }

        const transaction = await Transaction.create({
            resource: resource._id,
            owner: resource.owner,
            requester: req.user.id,
            status: "Pending",
            requesterCompleted: false,
            ownerCompleted: false,
            statusHistory: [{ status: "Pending" }]
        });

        res.status(201).json({ message: "Request sent successfully.", transaction });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ message: "You already have a pending request for this resource." });
        }
        console.error("Request resource error:", error);
        res.status(500).json({ message: "Unable to create the resource request." });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        res.json(await getTransactions({ requester: req.user.id }, req.user.id, true));
    } catch (error) {
        console.error("Get my requests error:", error);
        res.status(500).json({ message: "Unable to load your requests." });
    }
};

exports.getResourceRequests = async (req, res) => {
    try {
        res.json(await getTransactions({ owner: req.user.id }, req.user.id, true));
    } catch (error) {
        console.error("Get resource requests error:", error);
        res.status(500).json({ message: "Unable to load requests for your resources." });
    }
};

exports.getActiveTransactions = async (req, res) => {
    try {
        res.json(await getTransactions({
            status: "Approved",
            $or: [{ owner: req.user.id }, { requester: req.user.id }]
        }, req.user.id, true));
    } catch (error) {
        console.error("Get active transactions error:", error);
        res.status(500).json({ message: "Unable to load active transactions." });
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        res.json(await getTransactions({
            status: { $in: ["Completed", "Rejected", "Cancelled"] },
            $or: [{ owner: req.user.id }, { requester: req.user.id }]
        }, req.user.id));
    } catch (error) {
        console.error("Get transaction history error:", error);
        res.status(500).json({ message: "Unable to load transaction history." });
    }
};

async function approveTransaction(transaction, userId) {
    if (String(transaction.owner) !== String(userId)) {
        return { error: { status: 403, message: "Only the resource owner can accept this request." } };
    }
    if (transaction.status !== "Pending") {
        return { error: { status: 400, message: `Cannot approve a ${transaction.status.toLowerCase()} request.` } };
    }

    const resource = await Resource.findOneAndUpdate(
        {
            _id: transaction.resource,
            owner: transaction.owner,
            availability: "Available",
            $or: [{ status: "Available" }, { status: { $exists: false } }]
        },
        { $set: { availability: "Unavailable", status: "Unavailable" } },
        { new: true }
    );
    if (!resource) {
        return { error: { status: 400, message: "This resource is currently unavailable." } };
    }

    const now = new Date();
    const approved = await Transaction.findOneAndUpdate(
        { _id: transaction._id, status: "Pending" },
        {
            $set: {
                status: "Approved",
                approvedAt: now,
                requesterCompleted: false,
                ownerCompleted: false
            },
            $push: { statusHistory: { status: "Approved", changedAt: now } }
        },
        { new: true }
    );

    if (!approved) {
        await Resource.updateOne(
            { _id: resource._id, owner: transaction.owner },
            { $set: { availability: "Available", status: "Available" } }
        );
        return { error: { status: 409, message: "This request was changed by another action. Please refresh." } };
    }

    await Transaction.updateMany(
        { resource: transaction.resource, _id: { $ne: transaction._id }, status: "Pending" },
        {
            $set: { status: "Cancelled", cancelledAt: now },
            $push: { statusHistory: { status: "Cancelled", changedAt: now } }
        }
    );

    return { transaction: approved };
}

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Approved", "Rejected", "Cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid transaction status." });
        }
        if (!isValidId(req.params.id)) return res.status(404).json({ message: "Transaction not found." });

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: "Transaction not found." });

        if (status === "Approved") {
            const result = await approveTransaction(transaction, req.user.id);
            if (result.error) return res.status(result.error.status).json({ message: result.error.message });
            const populated = await baseTransactionQuery(Transaction.findById(result.transaction._id));
            return res.json({
                message: "Request approved.",
                transaction: await serializeTransaction(populated, req.user.id, true)
            });
        }

        if (transaction.status !== "Pending") {
            return res.status(400).json({ message: `Cannot change a ${transaction.status.toLowerCase()} request.` });
        }
        const isOwner = String(transaction.owner) === String(req.user.id);
        const isRequester = String(transaction.requester) === String(req.user.id);
        if (status === "Rejected" && !isOwner) {
            return res.status(403).json({ message: "Only the resource owner can reject this request." });
        }
        if (status === "Cancelled" && !isRequester) {
            return res.status(403).json({ message: "Only the requester can cancel this request." });
        }

        const now = new Date();
        const update = {
            $set: status === "Cancelled" ? { status, cancelledAt: now } : { status },
            $push: { statusHistory: { status, changedAt: now } }
        };
        const updated = await Transaction.findOneAndUpdate(
            { _id: transaction._id, status: "Pending" }, update, { new: true }
        );
        if (!updated) return res.status(409).json({ message: "This request was changed by another action. Please refresh." });

        const populated = await baseTransactionQuery(Transaction.findById(updated._id));
        res.json({
            message: status === "Rejected" ? "Request rejected." : "Request cancelled.",
            transaction: await serializeTransaction(populated, req.user.id)
        });
    } catch (error) {
        console.error("Update transaction status error:", error);
        res.status(500).json({ message: "Unable to update the transaction status." });
    }
};

exports.completeTransaction = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(404).json({ message: "Transaction not found." });
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: "Transaction not found." });
        if (!isParticipant(transaction, req.user.id)) {
            return res.status(403).json({ message: "Only transaction participants can mark it completed." });
        }
        if (transaction.status !== "Approved") {
            return res.status(400).json({ message: "Only approved transactions can be completed." });
        }

        const isOwner = String(transaction.owner) === String(req.user.id);
        const completionField = isOwner ? "ownerCompleted" : "requesterCompleted";
        if (transaction[completionField]) {
            return res.status(400).json({ message: "You have already marked this transaction completed." });
        }

        const marked = await Transaction.findOneAndUpdate(
            { _id: transaction._id, status: "Approved", [completionField]: false },
            { $set: { [completionField]: true } },
            { new: true }
        );
        if (!marked) return res.status(409).json({ message: "Your completion status was already recorded. Please refresh." });

        const now = new Date();
        const completed = await Transaction.findOneAndUpdate(
            { _id: marked._id, status: "Approved", ownerCompleted: true, requesterCompleted: true },
            {
                $set: { status: "Completed", completedAt: now },
                $push: { statusHistory: { status: "Completed", changedAt: now } }
            },
            { new: true }
        ) || marked;
        if (completed.status === "Completed") {
            await Resource.findByIdAndUpdate(completed.resource, {
                $set: { availability: "Available", status: "Available" }
            });
        }

        const populated = await baseTransactionQuery(Transaction.findById(completed._id));
        const message = completed.status === "Completed"
            ? "Transaction completed. The resource is available again."
            : "Completion recorded. Waiting for the other participant to complete.";
        res.json({ message, transaction: await serializeTransaction(populated, req.user.id) });
    } catch (error) {
        console.error("Complete transaction error:", error);
        res.status(500).json({ message: "Unable to update completion status." });
    }
};
