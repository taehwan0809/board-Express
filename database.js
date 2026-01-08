const {MongoClient, ObjectId} = require('mongodb');

const url = process.env.MONGOURL;
let connectDB = new MongoClient(url).connect()

module.exports = connectDB