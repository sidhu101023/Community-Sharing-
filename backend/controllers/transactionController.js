const Transaction = require("../models/Transaction");
const Resource = require("../models/Resource");
const { canRequestResource } = require("../discrete/logic");

const transitions = {
    Pending: ["Approved", "Rejected", "Cancelled"],
    Approved: ["Completed"],
    Rejected: [],
    Cancelled: [],
    Completed: []
};

exports.requestResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.body.resourceId);
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        if (!canRequestResource({ loggedIn: Boolean(req.user), userId: req.user.id, resource })) {
            return res.status(403).json({ message: "You can request only available resources owned by another user." });
        }
        const existing = await Transaction.findOne({ resource: resource._id, requester: req.user.id, status: "Pending" });
        if (existing) return res.status(400).json({ message: "You already have a pending request for this resource." });
        const transaction = await Transaction.create({
            resource: resource._id, owner: resource.owner, requester: req.user.id,
            statusHistory: [{ status: "Pending" }]
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const populateTransaction = query => query.populate("resource", "name category image availability")
    .populate("owner", "name email").populate("requester", "name email").sort({ createdAt: -1 });

exports.getMyRequests = async (req, res) => {
    try { res.json(await populateTransaction(Transaction.find({ requester: req.user.id }))); }
    catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getResourceRequests = async (req, res) => {
    try { res.json(await populateTransaction(Transaction.find({ owner: req.user.id }))); }
    catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
        if (!transitions[transaction.status]?.includes(status)) {
            return res.status(400).json({ message: `Cannot change ${transaction.status} to ${status}.` });
        }
        const isOwner = transaction.owner.toString() === req.user.id;
        const isRequester = transaction.requester.toString() === req.user.id;
        const allowed = (transaction.status === "Pending" && ((isOwner && ["Approved", "Rejected"].includes(status)) || (isRequester && status === "Cancelled"))) ||
            (transaction.status === "Approved" && isOwner && status === "Completed");
        if (!allowed) return res.status(403).json({ message: "You do not have permission for this transition." });

        transaction.status = status;
        transaction.statusHistory.push({ status });
        await transaction.save();
        if (status === "Approved") await Resource.findByIdAndUpdate(transaction.resource, { availability: "Unavailable", status: "Unavailable" });
        res.json({ message: `Request ${status.toLowerCase()}.`, transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
