function ownsRelation(resources) {
    return resources.map(resource => ({
        user: resource.owner.toString(),
        resource: resource._id.toString()
    }));
}

function requestsRelation(transactions) {
    return transactions.map(transaction => ({
        user: transaction.requester.toString(),
        resource: transaction.resource.toString()
    }));
}

module.exports = {
    ownsRelation,
    requestsRelation
};
