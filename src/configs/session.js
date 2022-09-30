const express = require('express');
const session = require('express-session');

const app = express();

// Setup session
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'somesecret',
    cookie: { maxAge: 60000 }
}));

var server = app.listen(() => {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

});

//Get session
const getSession = key => {
    app.get('/get_session', (req, res) => {
        //check session
        if (req.session.User) {
            return res.status(200).json({ status: 'success', session: req.session[key] })
        }
        return res.status(200).json({ status: 'error', session: 'No session' })
    })
}

module.exports = {
    getSession
}