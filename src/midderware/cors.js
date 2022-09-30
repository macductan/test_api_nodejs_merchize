const express = require('express');
const cors = require('cors');
const app = express();

const get_user_cors = (req, res, next) => {

    next();
}

module.exports = { get_user_cors }