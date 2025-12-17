const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const {MongoClient, ObjectId} = require('mongodb');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo').default;

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))



app.use(passport.initialize());
app.use(session({
    secret: process.env.SESSION_SECRET, //암호화 할 때 쓸 비번
    resave: false, //요청할 때마다 갱신할 건지
    saveUninitialized : false, //로그인 안 해도 세션 만들 건지
    cookie: {maxAge:60 * 60 * 1000},
    store : MongoStore.create({
        mongoUrl : process.env.MONGOURL,
        dbName : 'forum',
    })
}))
app.use(passport.session())

let db;
const url = process.env.MONGOURL;
new MongoClient(url).connect().then((client) =>{
    console.log('DB연결성공')
    db = client.db('forum');
    app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})
}).catch((err)=>{
    console.log(err)
})
// db 연결


app.get("/", (요청, 응답) => {
    응답.render("index.ejs");
});
// 메인

app.get('/list', async (req, res) => {
    let r = await db.collection('post').find().toArray()
    res.render('list.ejs', {posts: r})
})
// 글 리스트

app.get('/time', (req, res) => {
    t = new Date()
    res.render('time.ejs', t)
})
// 시간

app.get('/write', (req,res) =>{
    res.render('write.ejs')
})
// 작성


app.post('/new', async(req, res) => {
    
    try{
        if(!req.user){
            res.send('로그인 후 작성 부탁해요⭐')
        }else{
        if(req.body.title == '', req.body.content==''){
        res.send('똑바로 써라.');
        }
        else{
        await db.collection('post').insertOne({title: req.body.title, content: req.body.content});
        res.redirect('/list')}
    } 
    }catch(e){ 
        console.log(e) 
        res.status(500).send('서버 에러남');
    }
    
})
// DB에 작성 데이터 넣기


app.get('/detail/:legend', async (req, res) => {
    

    try{
    let result = await db.collection('post').findOne({_id: new ObjectId(req.params.legend)});
    if(result == null){
        res.send('아으... url 좀.')
    }
    res.render('detail.ejs', {detailPost:result})
    }catch(e){
        res.status(400).send('이상한 니 얼굴 입력함')
    }
})
// 상세 창


app.get('/updatee/:id', async (req,res)=>{
    let a = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});

    res.render('update.ejs', {updatId: a})

})
//수정 

app.put('/updatShit/:skrr', async (req, res) =>{

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


app.delete('/delete', async(req,res)=>{
    await db.collection('post').deleteOne({_id:new ObjectId(req.query.docid)})
    res.send('삭제완료');
})
// 삭제



app.get('/list/:id', async(req,res)=>{
    let result = await db.collection('post')
    .find().skip((req.params.id -1)*5)
    .limit(5).toArray()
    res.render('list.ejs', {posts:result})
})
// skip으로 건너뛰어라
// skip 안에 하드코딩으로 숫자를 넣을 수 있으나 너무 수가 크면 과부하 옴
// 1페이지, 2페이지 이런 기능에 사용


// app.get('/list/next/:id', async(req,res)=>{
//     let result = await db.collection('post')
//     .find({_id: {$gt:  new ObjectId(req.params.id)}}) //방금 본 마지막 게시물_id
//     .limit(5).toArray()
//     res.render('list.ejs', {posts:result})
// })

// 밑에서 더보기 클릭해서 리스트 더 가져올 때 사용. 개빠르다는 게 장점.
// 허나 페이지네이션 못 하고 현재 페이지에서만


passport.use(new LocalStrategy(async (id, pw, cb) => {
    let result = await db.collection('user').findOne({username: id})
    if(!result){
        return cb(null, false, {message : '아이디 db에 없음'})
    }
    if(await bcrypt.compare(pw, result.password)){
        return cb(null, result)
    }else{
        return cb(null, false, {message: '비번 불일치'});
    }
}))
// 아이디/ 비번이 db와 일치하는가?
// passport.authenticate('local')로 이 기능을 실행시킬 수 있음
// 아이디 비번이 db와 다르면 false를 cb() 안에 넣음


passport.serializeUser((user,done) =>{
    process.nextTick(() =>{
        done(null, {id:user._id,username: user.username})
    })
})
// done에 들어간 정보가 세션에 기록됨
// 쿠키 유저에게 보내주기
// 로그인 시 세션 만드는 코드
// user에는 위에 코드에서 입력한 정보가 들어있음
// process.next 어쩌구는 비동기 처리하는 함수

passport.deserializeUser(async(user, done) =>{
    let result = await db.collection('user').findOne({_id: new ObjectId(user.id)})
    delete result.password
    process.nextTick(() => {
        done(null, result)
    })
})
// req.user는 로그인된 유저 정보
// 유저가 보낸 쿠키 확인하기
// 쿠키 분석하는 기능
// 쿠키 이상 없으면 모든 api들에서 req.user하면 뿅 나옴



app.get('/signup', async(req,res)=>{
    res.render('sign.ejs')
})

app.post('/signup', async(req,res)=>{
    try{
    const check = await db.collection('user').findOne({username: req.body.username})
    if(!check){
        if(req.body.password == req.body.checkword){
        let hash = await bcrypt.hash(req.body.password, 10)
        await db.collection('user').insertOne({username: req.body.username, password: hash})
        .then(()=>{
            res.redirect('/')
        })
        }else{
            res.send('비번 틀림.')
        }
    }else{
        res.send("<script>alert('이미 있습니다.'); window.location.replace('/signup');</script>")
    }
    }catch(err){
        console.error(err)
    }

})


app.get('/login', async(req,res)=>{
    console.log(req.user)
    res.render('login.ejs')
})

                        
app.post('/login', async(req,res, next)=>{
    passport.authenticate('local', (error, user, info)=>{
        if(error) return res.status(500).json(error)
        if(!user) return res.status(401).json((info.message))
        req.logIn(user, (err)=>{
            if(err) return next(err)
            res.redirect('/')
            })
    })(req,res,next)
})
//로그인 성공인지 실패인지
// req.logIn이 실행되면 자동으로 위로 올라가서 serialize 실행


app.get('/mypage', async(req,res)=>{
    if(!req.user){
        res.send('로그인 후 접속해주세요')
    }else{
    res.render('myPage.ejs', {userInfo:req.user})
    }
})