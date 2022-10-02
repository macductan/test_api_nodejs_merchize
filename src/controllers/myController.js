require('dotenv').config();

const coreModel = require('../model/coreModel');

const selectUser = {
    "email": 1,
    "username": 1,
    "bio": 1,
    "image": 1,
    _id: 0,
};

const getUser = async (req) => {
    let get_user = req.user;
    let user = await coreModel.findOne('users', get_user, selectUser);
    return {user};
}

module.exports = {
    getUser
}