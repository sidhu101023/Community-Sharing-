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
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("User", userSchema);