const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Resource = require("../models/Resource");

const USER_COUNT = 1000;
const RESOURCE_COUNT = 1000;
const DEMO_PASSWORD = "Test@123";
const DEMO_EMAIL_PATTERN = /^demo\.user\d+@sharehub\.demo$/;

const categories = [
    "Mobile & Computer", "TV, Appliances & Electronics", "Sports", "Men's", "Women's",
    "Kids", "Books", "Home & Furniture", "Art"
];

const firstNames = [
    "Aarav", "Aditi", "Aditya", "Akash", "Ananya", "Aniket", "Anjali", "Arjun",
    "Diya", "Isha", "Kabir", "Kavya", "Meera", "Neha", "Nikhil", "Pranav",
    "Priya", "Rahul", "Riya", "Rohan", "Sakshi", "Sameer", "Shreya", "Siddharth",
    "Tanvi", "Varun", "Vedant", "Vikram", "Yash", "Zoya"
];

const lastNames = [
    "Bhosale", "Chavan", "Deshmukh", "Gawade", "Jadhav", "Joshi", "Kadam", "Kulkarni",
    "Mahajan", "More", "Naik", "Patil", "Pawar", "Rane", "Sane", "Shinde", "Thakur",
    "Wagh", "Wankhede", "Zende"
];

const locations = [
    ["Pune", 18.5204, 73.8567], ["Kothrud", 18.5074, 73.8077], ["Baner", 18.5590, 73.7868],
    ["Aundh", 18.5590, 73.8075], ["Wakad", 18.5975, 73.7898], ["Hinjewadi", 18.5913, 73.7389],
    ["Hadapsar", 18.5089, 73.9260], ["Viman Nagar", 18.5679, 73.9143], ["Kharadi", 18.5511, 73.9442],
    ["Koregaon Park", 18.5362, 73.8940], ["Shivajinagar", 18.5308, 73.8470], ["Katraj", 18.4529, 73.8652],
    ["Pimpri", 18.6298, 73.7997], ["Chinchwad", 18.6298, 73.7815], ["Kondhwa", 18.4697, 73.8900],
    ["Magarpatta", 18.5130, 73.9270], ["Pashan", 18.5387, 73.7970], ["Sinhagad Road", 18.4760, 73.8220],
    ["NIBM", 18.4655, 73.9010], ["Deccan", 18.5158, 73.8410]
];

const resourceNames = {
    "Mobile & Computer": ["Laptop", "Scientific Calculator", "Keyboard", "Mouse", "Monitor", "Arduino Kit", "Backpack"],
    "TV, Appliances & Electronics": ["Bluetooth Speaker", "Table Fan", "Mixer Grinder", "Smart TV", "Electric Kettle", "Power Bank"],
    Sports: ["Football", "Cricket Bat", "Badminton Racket", "Yoga Mat", "Chess Set", "Tennis Racket", "Camping Tent"],
    "Men's": ["Formal Shirt", "Denim Jacket", "Running Shoes", "Winter Jacket", "Travel Backpack", "Wrist Watch"],
    "Women's": ["Handbag", "Kurta Set", "Saree", "Flats", "Winter Shawl", "Jewellery Organizer"],
    Kids: ["Story Book Set", "Building Blocks", "School Backpack", "Toy Train", "Colouring Kit", "Skateboard"],
    Books: ["Novel", "Engineering Mathematics Book", "Pune Travel Guide", "Competitive Exam Guide", "Cookbook", "Biography"],
    "Home & Furniture": ["Table Lamp", "Chair", "Study Table", "Bookshelf", "Floor Cushion", "Storage Rack"],
    Art: ["Painting", "Watercolor Set", "Canvas Board", "Sketching Kit", "Clay Modelling Set", "Calligraphy Kit"]
};

const conditions = ["New", "Like New", "Good", "Fair"];

function makeLocation(index) {
    const [area, latitude, longitude] = locations[index % locations.length];
    const latitudeOffset = (((index * 37) % 1000) / 1000 - 0.5) * 0.008;
    const longitudeOffset = (((index * 61) % 1000) / 1000 - 0.5) * 0.008;

    return {
        address: `${area}, Pune, Maharashtra`,
        latitude: Number((latitude + latitudeOffset).toFixed(6)),
        longitude: Number((longitude + longitudeOffset).toFixed(6))
    };
}

function makeUsers(hashedPassword) {
    return Array.from({ length: USER_COUNT }, (_, index) => ({
        name: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`,
        email: `demo.user${index + 1}@sharehub.demo`,
        password: hashedPassword,
        phone: `9${String(100000000 + index).padStart(9, "0")}`,
        location: makeLocation(index),
        profileImage: `https://placehold.co/160x160/png?text=User+${index + 1}`,
        isDemo: true
    }));
}

function makeResources(userIds) {
    return Array.from({ length: RESOURCE_COUNT }, (_, index) => {
        const category = categories[index % categories.length];
        const names = resourceNames[category];
        const name = `${names[index % names.length]} ${index + 1}`;
        const location = makeLocation(index + USER_COUNT);
        const availability = index % 10 === 0 ? "Unavailable" : "Available";

        return {
            name,
            category,
            description: `A ${conditions[index % conditions.length].toLowerCase()} ${name.toLowerCase()} shared by a ShareHub community member near ${location.address}.`,
            condition: conditions[index % conditions.length],
            location,
            image: `https://placehold.co/600x400/png?text=${encodeURIComponent(category)}`,
            availability,
            status: availability,
            owner: userIds[Math.floor(Math.random() * userIds.length)],
            isDemo: true
        };
    });
}

async function ensureDemoEmailsAreAvailable() {
    const existingDemoUsers = await User.find({ isDemo: true }).select("_id").lean();
    const existingDemoResources = await Resource.find({ isDemo: true }).select("_id").lean();
    if (existingDemoUsers.length > 0 || existingDemoResources.length > 0) {
        throw new Error("Demo data already exists. Run `npm run seed:reset` to replace only demo data.");
    }

    const demoEmails = Array.from({ length: USER_COUNT }, (_, index) => `demo.user${index + 1}@sharehub.demo`);
    const existingEmails = await User.find({ email: { $in: demoEmails } }).select("email").lean();
    const conflictingEmail = existingEmails.find(user => DEMO_EMAIL_PATTERN.test(user.email));
    if (conflictingEmail) {
        throw new Error(`Cannot seed safely because ${conflictingEmail.email} belongs to an existing non-demo user.`);
    }
}

async function seed() {
    const reset = process.argv.includes("--reset");
    await connectDB();

    try {
        if (reset) {
            const deletedUsers = await User.deleteMany({ isDemo: true });
            const deletedResources = await Resource.deleteMany({ isDemo: true });
            console.log(`Removed demo data: ${deletedUsers.deletedCount} users, ${deletedResources.deletedCount} resources.`);
        } else {
            await ensureDemoEmailsAreAvailable();
        }

        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
        const createdUsers = await User.insertMany(makeUsers(hashedPassword), { ordered: true });
        const createdResources = await Resource.insertMany(makeResources(createdUsers.map(user => user._id)), { ordered: true });
        const availableCount = createdResources.filter(resource => resource.availability === "Available").length;
        const unavailableCount = createdResources.length - availableCount;

        console.log("\nShareHub Demo Data Seed Completed");
        console.log(`Users created: ${createdUsers.length}`);
        console.log(`Resources created: ${createdResources.length}`);
        console.log(`Available resources: ${availableCount}`);
        console.log(`Unavailable resources: ${unavailableCount}`);
        console.log(`\nDemo password:\n${DEMO_PASSWORD}`);
        console.log("\nExample login:\ndemo.user1@sharehub.demo");
        console.log("\nDatabase:\nconnected");
    } finally {
        await mongoose.disconnect();
    }
}

seed().catch(error => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
});
