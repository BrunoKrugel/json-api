var axios = require('axios').default;
var _ = require('underscore');

var express = require("express");
var app = express();

const cachedMap = new Map();

async function fetchTag(tag) {
    var res = await axios.get('https://api.hatchways.io/assessment/blog/posts', {
        params: {
            tag: tag
        }
    });
    return res.data
}

function cacheMiddleware(req, res, next) {

    var tag = req.query.tags;
    var sortBy = req.query.sortBy;
    var sortOrder = req.query.sortOrder;
    var cacheKey = `${tag}_${sortBy}_${sortOrder}`;
    console.log(cacheKey);
    var cached = cachedMap.get(cacheKey);

    if (cached) {
        console.log("Cache hit");
        res.writeHead(cached.status, cached.headers);
        res.end(cached.data);
    } else {
        console.log('Cache not hit');
        res.oldSend = res.send;
        res.send = function (data) {
            let cachedObject = {
                data: data,
                status: res.statusCode,
                headers: res.getHeaders()
            }
            cachedMap.set(cacheKey, cachedObject);
            res.oldSend(data);
        }
        next();
    }
}

function validateSortBy(sortBy) {
    const sortByValues = ['id', 'reads', 'likes', 'popularity'];
    if (sortByValues.indexOf(sortBy) === -1) {
        return false;
    }
    return true;
}

function validateSortOrder(sortOrder) {
    const sortByOrder = ['asc', 'desc'];
    if (sortByOrder.indexOf(sortOrder) === -1) {
        return false;
    }
    return true;
}

function removePostDuplicates(posts) {
    let lookupKey = new Set();
    return posts.filter(post => !lookupKey.has(post["id"]) && lookupKey.add(post["id"]));
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
        result = removePostDuplicates(result);
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