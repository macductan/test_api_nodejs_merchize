const { ObjectID } = require('bson');
const mongoose = require('mongoose');

const userNameDb = "admin";
const passwordDb = "lunago123";
const nameCollection = "api_nodejs";

const url = `mongodb+srv://${userNameDb}:${passwordDb}@cluster0.iyh7edn.mongodb.net/${nameCollection}`;

let users = new mongoose.Schema({
    email: String,
    username: String,
    bio: { type: String, default: null },
    image: { type: String, default: null },
    password: String,
    following: { type: Object, default: null }
});

let articles = new mongoose.Schema({
    slug: String,
    title: String,
    description: String,
    body: String,
    tagList: Array,
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
    favorited: { type: Object, default: null },
    author: { type: String, ref: 'users' },
})

let comments = new mongoose.Schema({
    id: Number,
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
    body: String,
    slug: { type: String, ref: 'articles' },
})

const returnSchema = nameSchema => {
    switch (nameSchema) {
        case 'users':
            return users;
        case 'articles':
            return articles;
        case 'comments':
            return comments
        default:
            break;
    }
}

module.exports = {
    url, returnSchema
}
// module.exports = mongoose.model('users', returnSchema);
