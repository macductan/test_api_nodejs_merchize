const express = require('express');
const api = require('./configs/api');
const route = require('./configs/routes');
const session = require('./configs/session');
const cors = require('cors');

const app = express();
const port = 3000;

// app.use(
//     cors({
//         origin: "http://localhost:8080",
//     })
// )

app.use(
    cors({
        origin: "*",
        methods: ['GET'],
    })
)

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
// })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
route.initRoute(app);
// API
api.initRoute(app);

// 404
app.use((req, res) => {
    return res.status(404);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})