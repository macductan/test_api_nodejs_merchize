require('dotenv').config();

const coreModel = require('../model/coreModel');
const jwt = require('jsonwebtoken');

const selectUser = {
    "email": 1,
    "username": 1,
    "bio": 1,
    "image": 1,
    _id: 0,
};
const current_date = new Date(Date.now() + 7 * 60 * 60 * 1000);

const somethingWrong = {
    "errors": {
        "notice": [
            "Something wrong"
        ]
    }
}

const notice = n => {
    return {
        "errors": {
            "notice": [
                n
            ]
        }
    }
}

const duplicateEntryPrimary = (obj = null) => {
    return {
        "errors": {
            "notice": [
                "Duqlicate entry primary"
            ]
        },
        "infomation": obj
    }
}

const checkRequest = (check, res, dataReturn = null) => {
    // if (check) {
    return res.status(200).json(dataReturn);
    // }
    // else {
    //     return res.status(403).json(somethingWrong);
    // }
}

const authentication = async (req, res) => {
    try {
        let user = req.body['user'];
        let data = await coreModel.findOne('users', user, selectUser);
        if (!data) return res.status(403).json(notice("Could't found this account"));
        data['token'] = jwt.sign(JSON.stringify(data), process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({
            'user': data,
        })
    } catch (error) {
        console.log(error)
        return res.status(403).json(somethingWrong)
    }
}

const registration = async (req, res) => {
    try {
        let user = req.body['user'];
        let where = { $or: [{ username: user['username'] }, { email: user['email'] }] };
        await coreModel.insert('users', user);
        let data = await coreModel.findOne('users', where, selectUser);
        data['token'] = '';
        return res.status(200).json({ 'user': data })
    } catch (error) {
        console.log(error)
        return res.status(403).json(somethingWrong)
    }
}

const getCurrentUser = async (req, res) => {
    let data = await coreModel.findOne('users', { username: req.user.username }, selectUser);
    if (!data) return res.status(403).json(notice("Could't found this account"));
    data['token'] = jwt.sign(JSON.stringify(data), process.env.ACCESS_TOKEN_SECRET)
    return res.status(200).json(
        {
            'user': data,
        }
    )
}

const updateUser = async (req, res) => {
    try {
        let user_login = req.user.username;
        let user = req.body["user"];
        if (typeof user['username'] === 'undefined')
            user['username'] = user_login

        let data = await coreModel.findOne('users', { 'username': user_login }, selectUser);
        Object.keys(user).forEach(e => {
            try {
                data[e] = user[e];
            } catch (error) {

            }
        })

        let where = { username: user_login };
        let checkUpdate = await coreModel.update("users", where, user);
        data['token'] = jwt.sign(JSON.stringify(data), process.env.ACCESS_TOKEN_SECRET)
        checkRequest(checkUpdate, res, { user: data })
    } catch (error) {
        console.log(error)
        return res.status(403).json(somethingWrong);
    }

}

const getProfile = async (req, res) => {
    try {
        let user = req.params;
        let data_user = await coreModel.findOne('users', user, ['username', 'bio', 'image']);
        data_user['following'] = false;

        // Get token
        let decoded;
        try {
            const author = req.header('Authorization');
            let token = author && author.split(' ')[1];
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {

        }

        if (typeof decoded !== 'undefined') {
            let user_login = await coreModel.findOne('users', { 'username': decoded.username });
            if (typeof user_login['following'][user.username] !== 'undefined')
                data_user['following'] = true;
        }
        return res.status(200).json(data_user);
    } catch (error) {
        console.log(error)
        return res.status(403).json(somethingWrong);
    }

}

const followUser = async (req, res) => {
    try {
        let username_url = req.path.split('/')[2];
        let get_user = await coreModel.findOne('users', { 'username': req.user.username })
        if (!get_user) return res.status(403).json(somethingWrong);
        let following = get_user.following;
        if (!following) following = {};
        if (typeof following[username_url] !== 'undefined') {
            return res.status(403).json(notice('You have been follow user ' + username_url));
        }
        following[username_url] = true;

        let checkUpdate = await coreModel.update('users', { 'username': req.user.username }, { 'following': following });
        checkRequest(checkUpdate, res, checkUpdate);
    } catch (error) {
        console.log(error)
        return res.status(403).json(somethingWrong);
    }
}

const unfollowUser = async (req, res) => {
    try {
        let user_url = req.path.split('/')[2];
        let user_login = req.user;
        let get_follow_user = await coreModel.findOne('users', { 'username': user_login.username }, ['following']);
        try {
            delete get_follow_user['following'][user_url];
        } catch (error) {

        }
        let checkUpdate = await coreModel.update('users', { 'username': user_login.username }, { 'following': get_follow_user.following });
        checkRequest(checkUpdate, res, checkUpdate);
    } catch (error) {
        console.log(error)
        return res.status(403).json(somethingWrong);
    }
}

const listArticles = async (req, res) => {
    try {
        let limit = null, offset = null, query = req.query, where = {};
        if (typeof query.author !== 'undefined') {
            where.author = query.author;
        }
        if (typeof query.tag !== 'undefined') {
            where.tagList = query.tag;
        }
        if (typeof query.favorited !== 'undefined') {
            where['favorited'] = {};
            where['favorited'][query.favorited] = true;
        }
        if (typeof query.limit !== 'undefined') {
            limit = parseInt(query.limit);
        }
        if (typeof query.author !== 'undefined') {
            offset = parseInt(query.offset);
        }
        console.log(where);
        let sort = { 'favoritesCount': -1 };
        let data = await coreModel.getListArticles(where, { limit, offset, sort });

        let data_res = { "articles": [] }
        await data.forEach(e => {
            try {
                if (typeof e['author_info']['following'][query.author] === 'undefined')
                    e['author_info']['following'] = false;
                else e['author_info']['following'] = true;
            } catch (error) {
                e['author_info']['following'] = false
            }
            delete e['author_info']['password'];
            if (e.tagList[0] == query.tag) data_res.articles.push(e);
        })

        data_res['articlesCount'] = Object.keys(data_res['articles']).length;
        return res.status(200).json(data_res);
    } catch (error) {
        console.log(error);
        return res.status(403).json(somethingWrong);
    }
}

const feedArticles = async (req, res) => {
    try {
        let get_user = await coreModel.findOne('users', { username: req.user.username });
        let following_array, get_followed, where = {};
        try {
            following_array = get_user['following'];
            get_followed = Object.keys(following_array);
            where[author] = { $in: get_followed }
        } catch (error) {
            following_array = [];
        }
        let list_articles = await coreModel.getListArticles(where);
        let data_res = { "articles": list_articles }
        data_res['articlesCount'] = Object.keys(data_res['articles']).length;
        return res.status(200).json(data_res);
    } catch (error) {
        console.log(error);
        return res.status(403).json(somethingWrong);
    }
}

const getArticles = async (req, res) => {
    try {
        let data = await coreModel.getListArticles(req.params);
        try {
            delete data['author_info']['password'];
        } catch (error) {

        }
        return res.status(200).json({ 'article': data[0] });
    } catch (error) {
        return res.status(403).json(somethingWrong);
    }
}

const createArticles = async (req, res) => {
    try {
        let articles = req.body.article;
        articles['slug'] = articles.title.toLowerCase().replaceAll(' ', '-');
        articles['author'] = req.user.username;

        // Get current date
        articles['createdAt'] = current_date;
        articles['updatedAt'] = current_date;

        // let data = await coreModel.findOne('articles', { 'slug': articles['slug'] });
        // if (data) {
        //     return res.status(403).json(duplicateEntryPrimary(['slug']))
        // }
        await coreModel.insert('articles', articles);
        let data = await coreModel.getListArticles({ slug: articles['slug'] });
        return res.status(200).json({ 'article': data[0] })
    } catch (error) {
        console.log(error);
        return res.status(403).json(somethingWrong);
    }
}

const updateArticles = async (req, res) => {
    try {
        let slug = req.params;
        let check_article = await coreModel.findOne('articles', slug);
        if (check_article.author != req.user.username) {
            return res.status(403).json(notice('Access deny'))
        }

        let article = req.body['article'];
        if (typeof article.title !== 'undefined') {
            article['slug'] = article.title.replaceAll(' ', '-');
            let check_slug = await coreModel.findOne('articles', { 'slug': article['slug'] });
            if (check_slug) return res.status(403).json(notice('Slug is exist'));
        }
        else {
            article['slug'] = slug.slug
        }

        article['updatedAt'] = current_date;

        let checkUpdate = await coreModel.update('articles', slug, article);
        let data = await coreModel.getListArticles({ 'slug': article['slug'] });
        checkRequest(checkUpdate, res, { 'article': data[0] });
    } catch (error) {
        console.log(error);
        return res.status(403).json(somethingWrong);
    }
}

const deleteArticles = async (req, res) => {
    try {
        let slug = req.params;
        let check_article = await coreModel.findOne('articles', slug);
        if (check_article.author != req.user.username) {
            return res.status(403).json(notice('Access deny'))
        }
        await coreModel.deleteOne('comments', req.params);
        let checkDelete = await coreModel.deleteOne('articles', req.params);
        checkRequest(checkDelete, res, checkDelete);
    } catch (error) {
        return res.status(403).json(somethingWrong);
    }
}

const addComment = async (req, res) => {
    try {
        let slug = req.params;
        let check_article = await coreModel.findOne('articles', slug);
        if (!check_article) {
            return res.status(403).json(notice('Non exist articles'))
        }

        let comment = req.body.comment;
        comment['id'] = parseInt(await coreModel.getIDComment('comments')) + 1;
        comment['createdAt'] = current_date;
        comment['slug'] = req.path.split('/')[2];
        await coreModel.insert('comments', comment);
        return res.status(200).json(comment)
    } catch (error) {
        return res.status(403).json(somethingWrong);
    }
}

const getComment = async (req, res) => {
    try {
        return res.status(200).json(await coreModel.findAll('comments', { 'slug': req.path.split('/')[2] }));
    } catch (error) {
        return res.status(403).json(somethingWrong);
    }
}

const deleteComment = async (req, res) => {
    try {
        let where = req.params;
        where['id'] = parseInt(where['id']);
        let check_comment = await coreModel.findOne('comments', where);
        console.log(check_comment);
        if (!check_comment) {
            return res.status(403).json(notice('Non exist comment'))
        }
        let checkDelete = await coreModel.deleteOne('comments', where);
        checkRequest(checkDelete, res, checkDelete);
    } catch (error) {
        return res.status(403).json(somethingWrong);
    }
}

const favoriteArticle = async (req, res) => {
    try {
        let slug = req.params;
        let user_login = req.user.username
        let check_articles = await coreModel.findOne('articles', slug);

        if (!check_articles) {
            return res.status(403).json(notice('Non exist article'));
        }

        if (!check_articles['favorited']) check_articles['favorited'] = {};
        if (typeof check_articles['favorited'][user_login] === 'undefined') {
            check_articles['favorited'][user_login] = true;
        }

        let check_update = await coreModel.update('articles', slug, { 'favorited': check_articles['favorited'] });
        let data_res = await coreModel.getListArticles(slug);
        data_res = data_res[0];
        data_res['favorited'] = true
        checkRequest(check_update, res, { 'article': data_res });
    } catch (error) {
        return res.status(403).json(somethingWrong);
    }
}

const deleteFavorite = async (req, res) => {
    try {
        let slug = req.params;
        let user_login = req.user.username
        let check_articles = await coreModel.findOne('articles', slug);
        if (!check_articles) {
            return res.status(403).json(notice('Non exist article'));
        }

        try {
            delete check_articles['favorited'][user_login];
        } catch (error) {

        }
        let check_update = await coreModel.update('articles', slug, { 'favorited': check_articles['favorited'] });
        checkRequest(check_update, res, check_update);
    } catch (error) {
        return res.status(403).json(somethingWrong);
    }
}

const getTags = async (req, res) => {
    try {
        let tags = await coreModel.getTags();
        tags = tags.map(obj => obj.tagList);
        let data_return = [];
        tags.forEach(e => {
            data_return = Array.from(new Set(data_return.concat(e)));
        })
        return res.status(200).json(data_return);
    } catch (error) {
        console.log(error);
        return res.status(403).json(somethingWrong);
    }
}

module.exports = {
    authentication, registration, getCurrentUser, updateUser, getProfile, followUser, listArticles, feedArticles, getArticles, createArticles, updateArticles, unfollowUser, deleteArticles, addComment, getComment, deleteComment, favoriteArticle, deleteFavorite, getTags
}