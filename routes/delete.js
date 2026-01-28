const router = require('express').Router();
const {MongoClient, ObjectId} = require('mongodb');
let connectDB = require('./../database.js')

let db;
connectDB.then((client) =>{
    console.log("연결 성공")
    db = client.db('forum');
}).catch((err)=>{
    console.log(err)
})

router.delete('/', async(req,res)=>{
    await db.collection('post').deleteOne({_id:new ObjectId(req.query.docid), user: new ObjectId(req.user._id)})
    res.send('삭제 완료')
})


module.exports = router