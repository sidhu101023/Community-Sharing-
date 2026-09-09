const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        condition: {
            type: String,
            enum: [
                "New",
                "Like New",
                "Good",
                "Fair",
                "Poor"
            ],
            required: true,
            default: "Good"
        },

        /*
         * Resource location
         */

        location: {
            address: {
                type: String,
                required: true
            },

            latitude: {
                type: Number,
                required: true
            },

            longitude: {
                type: Number,
                required: true
            }
        },

        image: {
            type: String,
            default: ""
        },

        availability: {
            type: String,
            enum: [
                "Available",
                "Unavailable"
            ],
            default: "Available"
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "Available",
                "Unavailable"
            ],
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Resource",
        resourceSchema
    );