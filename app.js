const express = require("express");
const app = express();

app.use(require('./api/routes'));

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

module.exports = app;