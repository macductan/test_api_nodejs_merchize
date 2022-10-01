const mongoose = require('mongoose');
const database = require('../configs/database');

const findOne = async (collection, where, getCol = null) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model(collection, database.returnSchema(collection));
    let docs = await db.findOne(where).select(getCol);
    if (docs) docs = docs.toObject();
    return docs;
}

const findAll = async (collection, where, getCol = null, sort = {}, limit_offset = { limit: null, offset: null }) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model(collection, database.returnSchema(collection));
    let docs = await db.find(where, getCol).limit(limit_offset.limit).skip(limit_offset.offset).sort(sort);
    return docs;
}

const getIDComment = async (collection) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model(collection, database.returnSchema(collection));
    let num;
    try {
        num = await db.aggregate([{
            $sort: {
                id: -1
            }
        }, {
            $limit: 1
        }])
        num = num[0]['id'];
    } catch (error) {
        num = 0;
    }

    return num;
}

const insert = async (collection, value) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model(collection, database.returnSchema(collection), collection);
    let v = new db(value);
    v.save((err, val) => {
        if (err)
            return err;
        return val;
    });
}

const update = async (collection, where, value) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model(collection, database.returnSchema(collection));
    let res = null;
    await db.updateOne(where, value).then(data => {
        if (data.modifiedCount)
            res = data;
    });
    return res;
}

const deleteOne = async (collection, where) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model(collection, database.returnSchema(collection));
    let res = null;
    await db.deleteOne(where).then(data => {
        if (data.deletedCount)
            res = data;
    });
    return res;
}

const getListArticles = async (where, format = { limit: null, offset: null, sort: null }) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model('article', database.returnSchema('articles'));
    let pipeline = [
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: 'username',
                as: 'author_info'
            }
        }, {
            $unwind: {
                path: '$author_info'
            }
        }, {
            $match: where
        }
        , {
            $addFields: {
                favoritesCount:
                    { $cond: { if: { $isArray: { $objectToArray: "$favorited" } }, then: { $size: { $objectToArray: "$favorited" } }, else: 0 } }
            }
        }
    ]

    if (format.sort) pipeline.push({ $sort: format.sort });
    if (format.offset) pipeline.push({ $skip: format.offset });
    if (format.limit) pipeline.push({ $limit: format.limit });

    let data = await db.aggregate(pipeline)
    // let data = await db.find(where);
    return data;
}

const getComments = async (where, format = { limit: null, offset: null, sort: null }) => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model('comments', database.returnSchema('comments'));
    let pipeline = [{
        $lookup: {
            from: 'articles',
            localField: 'slug',
            foreignField: 'slug',
            as: 'article'
        }
    }, {
        $unwind: {
            path: '$article'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'article.author',
            foreignField: 'username',
            as: 'author'
        }
    }, {
        $unwind: {
            path: '$author'
        }
    }, {
        $project: {
            author: {
                password: 0,
                following: 0
            }
        }
    }, {
        $match: where
    }];
    console.log(pipeline);

    if (format.sort) pipeline.push({ $sort: format.sort });
    if (format.offset) pipeline.push({ $skip: format.offset });
    if (format.limit) pipeline.push({ $limit: format.limit });

    let data = await db.aggregate(pipeline)
    // let data = await db.find(where);
    return data;
}

const getTags = async () => {
    mongoose.connect(database.url, { useNewUrlParser: true });
    let db = mongoose.model('article', database.returnSchema('articles'));
    return await db.aggregate([{
        $project: {
            tagList: 1
        }
    }]);
}

module.exports = {
    findOne, findAll, insert, update, deleteOne, getListArticles, getIDComment, getTags, getComments
}