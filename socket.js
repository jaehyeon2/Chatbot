const SocketIO=require('socket.io');

module.exports=(server, app)=>{
	const io=SocketIO(server, {path:'/socket.io'});
	app.set('io', io);
	const room=io.of('/room');
	const chat=io.of('/chat');
	
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
		
		socket.on('disconnect', ()=>{
			console.log('disconnect chat namespace');
			socket.leave(roomId);
		});
	});
};;