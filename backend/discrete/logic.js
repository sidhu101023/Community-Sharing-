function canRequestResource({ loggedIn, userId, resource }) {
    return Boolean(
        loggedIn &&
        resource &&
        resource.availability === "Available" &&
        resource.owner.toString() !== userId.toString()
    );
}

function matchesResourceFilters(resource, { search, category, maxDistance }) {
    const searchableText = [
        resource.name,
        resource.category,
        resource.description
    ].join(" ").toLowerCase();

    const matchesSearch = !search || searchableText.includes(search.toLowerCase());
    const matchesCategory = !category || category === "All Resources" || resource.category === category;
    const isAvailable = resource.availability === "Available";
    const matchesDistance = maxDistance === null ||
        (resource.distance !== null && resource.distance <= maxDistance);

    return matchesSearch && matchesCategory && isAvailable && matchesDistance;
}

module.exports = {
    canRequestResource,
    matchesResourceFilters
};
