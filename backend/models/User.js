const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            trim: true,
            match: [/^\+?[0-9]{10,15}$/, "Please provide a valid mobile number"]
        },

        /*
         * User location
         *
         * address  -> readable location
         * latitude -> used for distance calculation
         * longitude -> used for distance calculation
         */

        location: {
            address: {
                type: String,
                required: true,
                default: "Pune, Maharashtra"
            },

            latitude: {
                type: Number,
                required: false
            },

            longitude: {
                type: Number,
                required: false
            }
        },

        profileImage: {
            type: String,
            default: ""
        },

        isDemo: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("User", userSchema);
