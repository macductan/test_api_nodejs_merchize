const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const author = req.header('Authorization');
    let token = author && author.split(' ')[1];
    if (!token) return res.status(401).json();
    try {
        let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(403).json();
    }
}

module.exports = {
    verifyToken
}