var _ = require('underscore');

function validateSortBy(sortBy) {
    const sortByValues = ['id', 'reads', 'likes', 'popularity'];
    if (sortByValues.indexOf(sortBy) === -1) {
        return false;
    }
    return true;
}
module.exports.validateSortBy = validateSortBy;


function validateSortOrder(sortOrder) {
    const sortByOrder = ['asc', 'desc'];
    if (sortByOrder.indexOf(sortOrder) === -1) {
        return false;
    }
    return true;
}
module.exports.validateSortOrder = validateSortOrder;


function removePostDuplicates(posts) {
    let lookupKey = new Set();
    return posts.filter(post => !lookupKey.has(post["id"]) && lookupKey.add(post["id"]));
}
module.exports.removePostDuplicates = removePostDuplicates;


function postSort(list, sortBy, direction) {
    var sorted = _.sortBy(list, sortBy);
    if (direction === 'desc') {
        sorted.reverse();
    }
    return sorted;
}
module.exports.postSort = postSort;
