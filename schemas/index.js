const mongoose=require('mongoose');

const {MONGO_ID, MONGO_PW, NODE_ENV}=process.env;
const MONGO_URL=`mongodb://${MONGO_ID}:${MONGO_PW}@localhost:27017/admin`;

const connect=()=>{
	if(process.env.NODE_ENV!=='production'){
		mongoose.set('debug', true)
	}
	mongoose.connect(MONGO_URL,{
		dbName:'myChat',
		useNewUrlParser:true,
		useCreateIndex:true,
	},(error)=>{
		if(error){
			console.log('mongodb connect error!', error);
		}else{
			console.log('mongodb connect success!');
		}
	});
};

mongoose.connection.on('error', (error)=>{
	console.error('mongodb connect error!', error);
});
mongoose.connection.on('disconnected', ()=>{
	console.error('mongodb disconnection! try connect!');
	connect();
});

module.exports=connect;