const Transaction = require("../models/Transaction");

function calculateDistance(lat1, lon1, lat2, lon2) {
    const radians = value => value * Math.PI / 180;
    const dLat = radians(lat2 - lat1);
    const dLon = radians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function rankResources(user, resources) {
    const requests = await Transaction.find({ requester: user._id }).populate("resource", "category");
    const categoryCounts = requests.reduce((counts, request) => {
        const category = request.resource?.category;
        if (category) counts[category] = (counts[category] || 0) + 1;
        return counts;
    }, {});
    return resources.map(resource => {
        const distanceKm = calculateDistance(user.location.latitude, user.location.longitude,
            resource.location.latitude, resource.location.longitude);
        return {
            ...resource.toObject(),
            distanceKm,
            recommendationScore: (categoryCounts[resource.category] || 0) * 10 +
                Math.max(0, 10 - distanceKm) + resource.createdAt.getTime() / 1e12
        };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 12).map(({ recommendationScore, ...resource }) => resource);
}

module.exports = { rankResources };
