const express = require('express');
const cookieparser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const nunjucks = require('nunjucks');
const session = require('express-session');
const passport = require('passport');
const localpassport = require('passport-local');
const kakaopassport = require('passport-kakao');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const passportConfig = require('./passport'); //passport의 index연결
const favicon = require('serve-favicon');

const IndexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const v1 = require('./routes/v1');
const v2 = require('./routes/v2');


const {sequelize} = require('./models');
  
require('dotenv').config();

const app = express();

sequelize.sync();


app.set('port', process.env.PORT || 8002);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname,'public'))); // /main.css
app.use('/img', express.static(path.join(__dirname,'uploads'))); // /img/abc.png
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieparser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUnitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    },
}));
app.use('/v1',v1);
app.use('/v2',v2);
app.use(flash());

app.use(passport.initialize()); //passport 세션을 사용(express-session밑에 passport쪽 미들웨어 연결.)
app.use(passport.session());
passportConfig(passport);


app.use('/',IndexRouter);
app.use('/auth',authRouter);


app.use((req,res,next)=>{
    const err = new Error('NOT FOUND');
    err.status = 404;
    next(err);
});

app.use((err,req,res)=>{
    res.locals.message = err.message;
    res.locals.message = req.app.get('env') === 'development' ? err :{};
    res.status(err.status||500);
    res.render('error');
});

app.listen(app.get('port'),()=>{
    console.log(`${app.get('port')}번 포트에서 서버 대기중입니다!`);
});