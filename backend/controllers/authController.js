const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};


// REGISTER
exports.register = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            location
        } = req.body;


        if (
            !name ||
            !email ||
            !password ||
            !location
        ) {

            return res.status(400).json({

                message:
                    "Please fill all required fields"

            });

        }


        if (
            !location.address ||
            location.latitude === undefined ||
            location.longitude === undefined
        ) {

            return res.status(400).json({

                message:
                    "Please select your location on the map"

            });

        }


        const existingUser =
            await User.findOne({
                email
            });


        if (existingUser) {

            return res.status(400).json({

                message:
                    "Email already registered"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user =
            await User.create({

                name,

                email,

                password:
                    hashedPassword,

                location: {

                    address:
                        location.address,

                    latitude:
                        Number(
                            location.latitude
                        ),

                    longitude:
                        Number(
                            location.longitude
                        )

                }

            });


        res.status(201).json({

            message:
                "Registration successful"

        });


    } catch (error) {

        res.status(500).json({

            message:
                error.message

        });

    }

};


// LOGIN
exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                location: user.location
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};