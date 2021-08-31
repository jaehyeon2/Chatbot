const SocketIO=require('socket.io');
const axios=require('axios');
const cookieParser=require('cookie-parser');
const cookie=require('cookie-signature');

module.exports=(server, app, sessionMiddleware)=>{
	const io=SocketIO(server, {path:'/socket.io'});
	app.set('io', io);
	const room=io.of('/room');
	const chat=io.of('/chat');
	
	io.use((socket, next)=>{
		cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
		sessionMiddleware(socket.request, socket.request.res, next);
	});
	
	room.on('connection', (socket)=>{
		console.log('connect room namespace');
		socket.on('disconnect', ()=>{
			console.log('disconnect room namespace');
		});
	});
	
	chat.on('connection', (socket)=>{
		console.log('connect chat namespace');
		const req=socket.request;
		const {headers:{referer}}=req;
		const roomId=referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
		socket.join(roomId);
		
		socket.to(roomId).emit('join',{
			user:'system',
			chat:`${req.session.user}님이 입장하셨습니다.`,
		});
		
		socket.on('disconnect', ()=>{
			console.log('disconnect chat namespace');
			socket.leave(roomId);
			const currentRoom=socket.adapter.rooms[roomId];
			const userCount=currentRoom?currentRoom.length:0;
			if (userCount===0){
				const signedCookie=req.signedCookies['connect.sid'];
				const connectSID=cookie.sign(signedCookie, process.env.COOKIE_SECRET);
				axios.delete(`https://chat-nodejs.run.goorm.io/room/${roomId}`,{
					headers:{
						Cookie:`connect.sid=s%3A%{connectSID}`,
					},
				})
				.then(()=>{
					console.log('방 제거 요청 성공');
				})
				.catch((error)=>{
					console.error(error);
				});
			}else{
				socket.to(roomId).emit('exit', {
					user:'system',
					chat:`${req.session.user}님이 퇴장하셨습니다.`,
				});
			}
		});
	});
};