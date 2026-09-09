const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const connectDB =
    require("./config/db");

const app = express();


// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


// DATABASE
connectDB();


// API ROUTES
app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/resources",
    require("./routes/resourceRoutes")
);

app.use(
    "/api/transactions",
    require("./routes/transactionRoutes")
);

app.use(
    "/api/users",
    require("./routes/userRoutes")
);


// SERVE FRONTEND
app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// DEFAULT PAGE
app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../frontend/resources.html"
        )
    );

});


const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `ShareHub running on http://localhost:${PORT}`
    );

});