const Resource = require("../models/Resource");
const User = require("../models/User");
const { intersection } = require("../discrete/sets");
const { matchesResourceFilters } = require("../discrete/logic");

// D(User, Resource) -> distance in kilometres (Haversine formula).
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = value => value * Math.PI / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.getResources = async (req, res) => {
    try {
        const { search = "", category = "All Resources", distance } = req.query;
        const maxDistance = distance !== undefined && distance !== "" ? Number(distance) : null;
        if (maxDistance !== null && (!Number.isFinite(maxDistance) || maxDistance < 0)) {
            return res.status(400).json({ message: "Distance must be a non-negative number." });
        }
        const [user, resources] = await Promise.all([
            User.findById(req.user.id).select("location"),
            Resource.find().populate("owner", "name email profileImage location").sort({ createdAt: -1 })
        ]);
        if (!user) return res.status(401).json({ message: "User not found" });

        // R is all resources; search, category, availability and distance each form a subset of R.
        const R = new Set(resources.map(resource => resource._id.toString()));
        const enrichedResources = resources.map(resource => {
            const object = resource.toObject();
            const hasCoordinates = Number.isFinite(user.location?.latitude) && Number.isFinite(user.location?.longitude) &&
                Number.isFinite(object.location?.latitude) && Number.isFinite(object.location?.longitude);
            object.distance = hasCoordinates ? calculateDistance(user.location.latitude, user.location.longitude,
                object.location.latitude, object.location.longitude) : null;
            return object;
        });
        const searchSet = new Set(enrichedResources.filter(resource => !search || [resource.name, resource.category, resource.description]
            .join(" ").toLowerCase().includes(search.toLowerCase())).map(resource => resource._id.toString()));
        const categorySet = new Set(enrichedResources.filter(resource => category === "All Resources" || resource.category === category)
            .map(resource => resource._id.toString()));
        const availableSet = new Set(enrichedResources.filter(resource => resource.availability === "Available")
            .map(resource => resource._id.toString()));
        const distanceSet = new Set(enrichedResources.filter(resource => maxDistance === null ||
            (resource.distance !== null && resource.distance <= maxDistance)).map(resource => resource._id.toString()));
        const finalSet = intersection(intersection(R, searchSet), intersection(categorySet, intersection(availableSet, distanceSet)));

        const result = enrichedResources.filter(resource => finalSet.has(resource._id.toString()))
            .filter(resource => matchesResourceFilters(resource, { search, category, maxDistance }))
            .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id).populate("owner", "name email profileImage location");
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createResource = async (req, res) => {
    try {
        const { name, category, description, condition, location, image, availability } = req.body;
        if (!name || !category || !description || !condition || !location?.address || !Number.isFinite(Number(location.latitude)) || !Number.isFinite(Number(location.longitude))) {
            return res.status(400).json({ message: "Complete every resource field and select a map location." });
        }
        const resource = await Resource.create({
            name, category, description, condition,
            location: { address: location.address, latitude: Number(location.latitude), longitude: Number(location.longitude) },
            image: image || "", availability: availability === "Unavailable" ? "Unavailable" : "Available", owner: req.user.id
        });
        const populatedResource = await Resource.findById(resource._id).populate("owner", "name email profileImage location");
        res.status(201).json({ message: "Resource added successfully", resource: populatedResource });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.calculateDistance = calculateDistance;
