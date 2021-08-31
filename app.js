const express=require('express');
const path=require('path');
const morgan=require('morgan');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const nunjucks=require('nunjucks');
const dotenv=require('dotenv');
const passport=require('passport');

dotenv.config();
const webSocket=require('./socket');
const indexRouter=require('./routes');
const authRouter=require('./routes/auth');
const connect=require('./schemas');
const passportConfig=require('./passport');

const app=express();
passportConfig();
app.set('port', process.env.PORT||8001);
app.set('view engine', 'html');
nunjucks.configure('views',{
	express:app,
	watch:true,
});

const sessionMiddleware=session({
	resave:false,
	saveUninitialized:false,
	secret:process.env.COOKIE_SECRET,
	cookie:{
		httpOnly:true,
		secure:false,
	},
});

connect();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/auth', authRouter);

app.use((req, res, next)=>{
	const error=new Error(`${req.method} ${req.url} 라우터가 존재하지 않습니다.`);
	error.status=404;
	next(error);
});

app.use((err, req, res, next)=>{
	res.locals.message=err.message;
	res.locals.error=process.env.NODE_ENV!=='production'?err:{};
	res.status(err.status||500);
	res.render('error');
});

const server=app.listen(app.get('port'), ()=>{
	console.log(app.get('port'), 'port waiting');
});

webSocket(server, app, sessionMiddleware);