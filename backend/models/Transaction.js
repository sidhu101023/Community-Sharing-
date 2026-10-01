const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected",
                "Cancelled",
                "Completed"
            ],
            default: "Pending"
        },

        requesterCompleted: {
            type: Boolean,
            default: false
        },

        ownerCompleted: {
            type: Boolean,
            default: false
        },

        approvedAt: {
            type: Date
        },

        completedAt: {
            type: Date
        },

        cancelledAt: {
            type: Date
        },

        statusHistory: [{
            status: {
                type: String,
                enum: ["Pending", "Approved", "Rejected", "Cancelled", "Completed"],
                required: true
            },
            changedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true
    }
);

transactionSchema.index(
    { resource: 1, requester: 1 },
    { unique: true, partialFilterExpression: { status: "Pending" } }
);

module.exports = mongoose.model("Transaction", transactionSchema);
