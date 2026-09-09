function union(setA, setB) {
    return new Set([...setA, ...setB]);
}

function intersection(setA, setB) {
    return new Set(
        [...setA].filter(item => setB.has(item))
    );
}

function difference(setA, setB) {
    return new Set(
        [...setA].filter(item => !setB.has(item))
    );
}

module.exports = {
    union,
    intersection,
    difference
};
