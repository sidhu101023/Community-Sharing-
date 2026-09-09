function buildGraph(resources, transactions) {

    const graph = {};

    resources.forEach(resource => {
        const owner = resource.owner.toString();
        const resourceId = resource._id.toString();
        graph[owner] = graph[owner] || [];
        graph[owner].push({ vertex: resourceId, relation: "OWNS" });
    });

    transactions.forEach(transaction => {

        const user =
            transaction.requester.toString();

        const resource =
            transaction.resource.toString();

        graph[user] = graph[user] || [];
        graph[user].push({ vertex: resource, relation: "REQUESTS" });

    });

    return graph;
}

module.exports = {
    buildGraph
};
