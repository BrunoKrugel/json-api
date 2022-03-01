const axios = require('axios').default;

async function fetchTag(tag) {
    var res = await axios.get('https://api.hatchways.io/assessment/blog/posts', {
        params: {
            tag: tag
        }
    });
    return res.data
}
module.exports = fetchTag;