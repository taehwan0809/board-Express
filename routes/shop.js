const router = require('express').Router();

function checkLogin(req,res,next){
    if(!req.user){
        res.send('로그인 먼저!')
    }else{
        next()
    }
}

router.get('/shop/shirts',checkLogin, async(req,res)=>{
    await db.collection('post').find().toArray()
    res.send('셔츠 페이지')
})
router.get('/shop/pants',checkLogin, (req,res)=>{
    res.send('바지 페이지')
})


module.exports = router