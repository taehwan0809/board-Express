const router = require('express').Router();

const {MongoClient, ObjectId} = require('mongodb');
const connectDB = require('./../database.js');

let db;
connectDB.then((client) =>{
    db = client.db('forum');
}).catch((err)=>{
    console.log(err)
})


router.get('/:id', async (req,res)=>{
    let a = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});

    res.render('update.ejs', {updatId: a})

})
//수정 

router.put('/:skrr', async (req, res) =>{

            try{
                const before = await db.collection('post').findOne({_id: new ObjectId(req.params.skrr)})
                if(before.title == req.body.title && before.content == req.body.content){
                    res.send('수정할 게 없는데용?')
                }else{
                    await db.collection('post').updateOne({_id: new ObjectId (req.params.skrr)},{$set:{title: req.body.title, content: req.body.content}});
                    res.redirect('/list')
                }
            }catch(e){
                res.status(400).send('똑바로 안 해?')
            }
})
// 수정 넣기


module.exports = router