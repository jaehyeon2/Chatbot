const mongoose=require('mongoose');

const {Schema}=mongoose;
const userSchema=new Schema({
	email:{
		type:String,
		required:true,
	},
	nick:{
		type:String,
		required:true,
		unieuq:true,
	},
	password:{
		type:String,
		required:true,
	},
	createdAt:{
		type:Date,
		defualt:Date.now,
	},
});

module.exports=mongoose.model('User', userSchema);