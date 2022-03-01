var express = require("express");
var axios = require('axios').default;
var _ = require('underscore');

var app = express();

const sortByValues = ['id', 'reads', 'likes', 'popularity'];
const sortByOrder = ['asc', 'desc'];


async function fetchTag(tag) {
    var res = await axios.get('https://api.hatchways.io/assessment/blog/posts', {
        params: {
            tag: tag
        }
    });
    return res.data
}

function validateSortBy(sortBy) {
    if (sortByValues.indexOf(sortBy) === -1) {
        return false;
    }
    return true;
}

function validateSortOrder(sortOrder) {
    if (sortByOrder.indexOf(sortOrder) === -1) {
        return false;
    }
    return true;
}

function postSort(list, sortBy, direction) {
    var sorted = _.sortBy(list, sortBy);
    if (direction === 'desc') {
        sorted.reverse();
    }
    return sorted;
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get("/api/ping", (req, res, next) => {
    res.statusCode = 200;
    res.json({
        "success": "true"
    });
});

app.get("/api/posts", (req, res, next) => {

    if (req.query.tags === undefined) {
        res.statusCode = 400;
        res.json({
            "error": "Tags parameter is required"
        });
        return;
    }


    const myTags = req.query.tags.split(",");

    let sortBy = req.query.sortBy;
    if (sortBy === undefined) {
        sortBy = 'id';
    }

    let direction = req.query.direction;
    if (direction === undefined) {
        direction = 'asc';
    }

    if ((!validateSortBy(sortBy)) || (!validateSortOrder(direction))) {
        res.statusCode = 400;
        res.json({
            "error": "Invalid sortBy value"
        });
        return;
    }

    let mapTags = myTags.map(tag => fetchTag(tag));

    Promise.all(mapTags).then(values => {
        let result = values.reduce((acc, val) => {
            let flatVal = _.flatten(val.posts, 1);
            return acc.concat(flatVal);
        }, []);

        //Duplicates
        let lookupKey = new Set();
        result = result.filter(post => !lookupKey.has(post["id"]) && lookupKey.add(post["id"]));
        //Sort
        result = postSort(result, sortBy, direction);

        res.statusCode = 200;
        res.json({
            posts: result
        });
    }).catch(err => {
        res.statusCode = 500;
        res.json({
            "error": err.message
        });
    });
});