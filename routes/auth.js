const express=require('express');
const bcrypt=require('bcrypt');
const passport=require('passport');

const {isLoggedIn, isNotLoggedIn}=require('./middlewares');
const User=require('../schemas/user');

const router=express.Router();

router.post('/join', isNotLoggedIn, async(req, res, next)=>{
	const {email, nick, password}=req.body;
	console.log('email', email);
	try{
		const exUser=await User.findOne({email:email});
		console.log('exUser', exUser);
		if(exUser){
			return res.redirect('/join?joinError=이미 가입된 이메일입니다.');
		}
		const hash=await bcrypt.hash(password, 12);
		await User.create({
			email,
			nick,
			password:hash,
		});
		return res.redirect('/');
	}catch(error){
		console.error(error);
		return next(error);
	}
});

router.post('/login', isNotLoggedIn, (req, res, next)=>{
	passport.authenticate('local', (authError, user, info)=>{
		if(authError){
			console.error(authError);
			return next(authError);
		}
		if(!user){
			return res.redirect(`/?loginError=${info.message}`);
		}
		return req.login(user, (loginError)=>{
			if(loginError){
				console.error(loginError);
				return next(loginError);
			}
			return res.redirect('/');
		});
	})(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res)=>{
	req.logout();
	req.session.destroy();
	res.redirect('/');
});

module.exports=router;