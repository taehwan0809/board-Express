const router = require('express').Router();


function checkLogin(req,res,next){
    if(!req.user){
        res.send('로그인 해라')
    }else{next()}
    
}









router.get('/sports',checkLogin, (req, res) => {
    res.send('스포츠 게시판')
})
router.get('/game', (req, res) => {
    res.send('게임 게시판')
}) 


module.exports = router