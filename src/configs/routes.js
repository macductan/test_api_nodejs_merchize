const express = require('express');
const path = require('path');

const route = express.Router();

const initRoute = app => {
    route.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/test.html'));
    });
    return app.use('/', route);
}

module.exports = {
    initRoute
}