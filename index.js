// entrypoint of the server
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';


const app = express();

app.get('/',(req,res)=>{
    res.send("API Running");
})
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin: "*",
    }
});

// const getRoomMemberCount = (roomName)=>{
//     const room = io.sockets.adapter.rooms.get(roomName);
//     if(room) return room.size;
//     else return 0;
// }

const playersInRooms = new Map();
const playerInfo = new Map();

setInterval(()=>{
    playerInfo.clear();
    playersInRooms.clear();
},20*60*1000);

io.on('connection', (socket)=>{

    console.log(`A user connected: ${socket.id}`);

    let socketTimeOut;
    let resetInv;

    const InactivityTimeout = (time)=>{
        return setTimeout(() => {
            const room = Array.from(socket.rooms)[1];
            if(playersInRooms.has(room)){
                let count = playersInRooms.get(room).size;
                if(count==2) playersInRooms.get(room).delete(socket.id);
                else if(count==1) playersInRooms.delete(room);
            }
            playerInfo.delete(socket.id);
            socket.emit('status','disconnected');
            socket.to(room).emit('status','wait');
            socket.to(room).emit('playerID',1);
            socket.emit('newState',[0,1,2,3,4,5,6,7,8]);
            socket.to(room).emit('newState',[0,1,2,3,4,5,6,7,8]);
            socket.to(room).emit('resetChat');

            socket.leave(room);
            socket.disconnect(true);
        }, time);
    }

    socket.on('enterRoom', ({roomname,username})=>{

        resetInv = setInterval(()=>{
            playersInRooms.delete(roomname)
        },10*60*1000);


        if(!playersInRooms.has(roomname)){

            playersInRooms.set(roomname, new Set());
            playersInRooms.get(roomname).add(socket.id);
            playerInfo.set(socket.id,username);

            socket.join(roomname);

            socket.emit('playerID',1);
            socket.emit('status','wait'); 

            socketTimeOut = InactivityTimeout(60000);

            console.log(playersInRooms);

        }else{

            const memberCount = playersInRooms.get(roomname).size;
            if(memberCount==1){
                const prevMemberID = Array.from(playersInRooms.get(roomname))[0];
                playersInRooms.get(roomname).add(socket.id);
                playerInfo.set(socket.id,username);

                socket.join(roomname);
                socket.emit('playerID',2);

                socket.emit('status','startGame');
                socket.to(roomname).emit('status','startGame');

                socket.emit('opponent',playerInfo.get(prevMemberID));
                socket.to(roomname).emit('opponent',username);

                socket.emit('turn',false);
                socket.to(roomname).emit('turn',true);

                socketTimeOut = InactivityTimeout(60000);

            }else{
                socket.emit('status','RoomFull');
            }
            console.log(playersInRooms);
        }

    })

    socket.on('move',(data)=>{

        clearInterval(socketTimeOut);
        socketTimeOut = InactivityTimeout(60000);

        const room = Array.from(socket.rooms)[1];

        socket.to(room).emit('newState',data);

        socket.emit('turn',false);
        socket.to(room).emit('turn',true);
    })

    socket.on('resetCurrentResult',()=>{
        const room = Array.from(socket.rooms)[1];

        socket.emit('resetCurrRes');
        socket.to(room).emit('resetCurrRes');
    })

    socket.on('message',(text)=>{
        clearInterval(socketTimeOut);
        socketTimeOut = InactivityTimeout(60000);

        const room = Array.from(socket.rooms)[1];

        socket.to(room).emit('recieved',text);
        socket.emit('sent',text);
    })

    socket.on('resetChat',()=>{
        const room = Array.from(socket.rooms)[1];
        socket.to(room).emit('resetChat');
    })

    socket.on('leave', ()=>{
        const room = Array.from(socket.rooms)[1];

        if(!playersInRooms.has(room)) return;

        if(playersInRooms.get(room).size == 2){

            playersInRooms.get(room).delete(socket.id);
            socket.leave(room);
            socket.to(room).emit('status','wait');
            socket.to(room).emit('playerID',1);
            socket.to(room).emit('newState',[0,1,2,3,4,5,6,7,8]);
            playerInfo.delete(socket.id);

        }else if(playersInRooms.get(room).size == 1){

            playersInRooms.get(room).delete(socket.id);
            socket.leave(room);
            playersInRooms.delete(room);
            playerInfo.delete(socket.id);

        }
    })

    socket.on('disconnect', ()=>{
        console.log(`A user disconnected ${socket.id}`);
        console.log(playersInRooms);
    })

})

const port = process.env.PORT || 5000;
server.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
})