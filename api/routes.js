const {
    validateSortBy,
    validateSortOrder,
    postSort,
    removePostDuplicates
} = require('../src/arrayFunctions');

const { fetchTag } = require('../src/fetchTag');
const express = require('express');
const router = express.Router();
const _ = require('underscore');


function cacheMiddleware(req, res, next) {
    let cachedMap = new Map();

    var tag = req.query.tags;
    var sortBy = req.query.sortBy;
    var sortOrder = req.query.sortOrder;
    var cacheKey = `${tag}_${sortBy}_${sortOrder}`;
    var cached = cachedMap.get(cacheKey);

    if (cached) {
        res.writeHead(cached.status, cached.headers);
        res.end(cached.data);
    } else {
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


router.get("/api/ping", (req, res, next) => {
    res.statusCode = 200;
    res.json({
        "success": "true"
    });
});


router.get("/api/posts", cacheMiddleware, (req, res, next) => {

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

module.exports = router;