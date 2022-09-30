const express = require('express');
const apiController = require('../controllers/apiController');
const midderWare = require('../midderware/auth');

const route = express.Router();

const initRoute = app => {
    route.post('/users/login', apiController.authentication);
    route.post('/users', apiController.registration);
    route.get('/user', midderWare.verifyToken, apiController.getCurrentUser);
    route.put('/user', midderWare.verifyToken, apiController.updateUser);
    route.get('/articles', apiController.listArticles);
    route.get('/articles/feed', midderWare.verifyToken, apiController.feedArticles);
    route.post('/articles', midderWare.verifyToken, apiController.createArticles);

    route.get('/profiles/:username', apiController.getProfile);
    route.post('/profiles/:username/follow', midderWare.verifyToken, apiController.followUser);
    route.delete('/profiles/:username/follow', midderWare.verifyToken, apiController.unfollowUser);
    route.get('/articles/:slug', apiController.getArticles);
    route.put('/articles/:slug', midderWare.verifyToken, apiController.updateArticles);
    route.delete('/articles/:slug', midderWare.verifyToken, apiController.deleteArticles);
    route.post('/articles/:slug/comments', midderWare.verifyToken, apiController.addComment);
    route.get('/articles/:slug/comments', apiController.getComment);
    route.delete('/articles/:slug/comments/:id', midderWare.verifyToken, apiController.deleteComment);
    route.post('/articles/:slug/favorite', midderWare.verifyToken, apiController.favoriteArticle);
    route.delete('/articles/:slug/favorite', midderWare.verifyToken, apiController.deleteFavorite);
    route.get('/tags', apiController.getTags);
    return app.use('/api', route);
}

module.exports = {
    initRoute
}