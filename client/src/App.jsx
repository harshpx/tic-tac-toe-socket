import React, { useEffect, useRef, useState } from 'react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from './assets/icon1.png';
import wallpaper from './assets/wall1.png';
import playerOne from './assets/player1.png';
import playerTwo from './assets/player2.png';

import { IoExit } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import Square from './components/Square.jsx';
import decision from './features/gameLogic.js';
import {socket as soc} from './features/socket.js';


const App = () => {
    const arr = [0,1,2,3,4,5,6,7,8];

    const [gameCount,setGameCount] = useState(1);
    const [win,setWin] = useState(0);
    const [lost,setLost] = useState(0);

    const [gameState,setGameState] = useState([...arr]);
    const [gameResult,setGameResult] = useState('');

    const [playing,setPlaying] = useState(false);
    const [waiting,setWaiting] = useState(false);

    
    const [roomName,setRoomName] = useState('');
    const [myID,setMyID] = useState(0);
    const [myName,setMyName] = useState('You');
    const [opponentName,setOpponentName] = useState('Opponent');
    const [turn,setTurn] = useState(false);

    // const setRandomGame = ()=>{
    //     setPlaying(true);
    //     soc.connect();
    // }

    const [loading,setLoading] = useState(false);

    // joining a specific room

    const [uname,setUname] = useState('');
    const [rname,setRname] = useState('');

    const setCustomRoom = (e)=>{
        e.preventDefault();
        const username = uname;
        const roomname = rname;
        setRoomName(roomname);
        if(username){setMyName(username);}
        if(roomName=='') {
            return;
        }
        setLoading(true);
        soc.connect();
        soc.emit('enterRoom',{roomname,username});
    }

    // leaving/disconnecting
    const disconnect = ()=>{
        setPlaying(false);
        setWaiting(false);
        soc.emit('leave');
        soc.disconnect();
        setGameResult('');
        setWin(0);
        setLost(0);
        setGameState([0,1,2,3,4,5,6,7,8]);
        setGameCount(1);
        setMyID(0);
        setMyName('');
        setOpponentName('');
        setChat([]);
        toast.success('Disconnected')
    }

    const restartGame = ()=>{
        setGameResult('');
        soc.emit('move',[0,1,2,3,4,5,6,7,8]);
        setGameState([0,1,2,3,4,5,6,7,8]);
        soc.emit('resetCurrentResult');
    }

    // room status
    useEffect(()=>{
        soc.on('status',(message)=>{
            if(message=='RoomFull'){
                console.log('Room is Full');
                toast.error('Room is Full');
                setPlaying(false);
                setWaiting(false);
            }else if(message=='startGame'){
                console.log("Game started!");
                toast.success('Game Started');
                setWaiting(false);
                setPlaying(true);
            }else if(message=='wait'){
                console.log('waiting for other player...');
                setWaiting(true);
                toast.success('Waiting for other player');
                setOpponentName('Opponent')
                setPlaying(false);
            }else if(message=='disconnected'){
                setPlaying(false);
                setWaiting(false);
                setOpponentName('Opponent');
                setWin(0);
                setLost(0);
                setMyName('You');
                setMyID(0);
                setGameResult('');
                setGameState([0,1,2,3,4,5,6,7,8]);
                setChat([]);
                toast.success('Disconnected')
            }
            setLoading(false);
        })

        soc.on('opponent',(name)=>{
            setOpponentName(name);
        })

        window.addEventListener('beforeunload',disconnect);

        return ()=>{
            window.removeEventListener('beforeunload',disconnect);
        }
    },[soc])

    useEffect(()=>{
        soc.on('resetChat',()=>{
            setChat([]);
        })
        window.addEventListener('beforeunload',disconnect);

        return ()=>{
            window.removeEventListener('beforeunload',disconnect);
        }
    },[soc])

    useEffect(()=>{
        soc.on('playerID',(id)=>{
            setMyID(id);
        })
        console.log(myID);
        window.addEventListener('beforeunload',disconnect);

        return ()=>{
            window.removeEventListener('beforeunload',disconnect);
        }
    },[soc,myID])

    useEffect(()=>{
        soc.on('resetCurrRes',()=>{
            setGameResult('');
            setGameCount(prev=>prev+1);
        })
        window.addEventListener('beforeunload',disconnect);

        return ()=>{
            window.removeEventListener('beforeunload',disconnect);
        }
    },[soc])

    useEffect(()=>{
        if(waiting){
            setGameResult('');
            setGameCount(1);
            setGameState([0,1,2,3,4,5,6,7,8]);
            setLost(0); setWin(0);
            setChat([]);
        }
    },[waiting])

    useEffect(()=>{
        soc.on('turn',(myTurn)=>{
            setTurn(myTurn);
        })
        window.addEventListener('beforeunload',disconnect);

        return ()=>{
            window.removeEventListener('beforeunload',disconnect);
        }
    },[soc,waiting])


    // game manager
    useEffect(()=>{
        const result = decision(gameState);
        if(result[0]==='x'){
            if(myID===1) {setGameResult('You won!'); setWin(prev=>prev+1);}
            else if(myID===2) {setGameResult('You Lost :/'); setLost(prev=>prev+1);}
        }else if(result[0]==='o'){
            if(myID===1) {setGameResult('You Lost :/'); setLost(prev=>prev+1);}
            else if(myID===2) {setGameResult('You won!'); setWin(prev=>prev+1);}
        }else if(result[0]==='draw'){
            setGameResult('Match drawn ^_^')
        }
    },[gameState]);

    const [chat,setChat] = useState([]);

    function removeDuplicates(arr) {
        return arr.filter((item,index) => arr.indexOf(item) === index);
    }

    useEffect(()=>{
        soc.on('sent',(text)=>{
            setChat(prevChats => [...prevChats,['sent',text]]);
            setChat(prevChats=>removeDuplicates(prevChats));
            // ref.current.innerHTML+=`<div className="rounded-lg rounded-br-none px-1 py-0.5 bg-pink-700">${text}</div>`
        })
        soc.on('recieved',(text)=>{
            setChat(prevChats => [...prevChats,['recieved',text]]);
            setChat(prevChats=>removeDuplicates(prevChats));
            // ref.current.innerHTML+=`<div className="rounded-lg rounded-tl-none px-1 py-0.5 bg-neutral-800">${text}</div>`
        })

        window.addEventListener('beforeunload',disconnect);

        return ()=>{
            window.removeEventListener('beforeunload',disconnect);
        }
    },[soc])


    const [txt,setTxt] = useState('');

    const sendMessage = ()=>{
        soc.emit('message',txt);
        setTxt('');
    }

    const [showInput,setShowInput] = useState(false);

    if(!playing && !waiting){
        
        return (
            <div className='min-h-screen min-w-full bg-neutral-800 text-white flex flex-col items-center justify-center gap-y-10' style={{backgroundImage:`url(${wallpaper})`, backgroundPosition:'center'}}>
                <div className='absolute bottom-4'>Made with &hearts; by Harsh Priye</div>
                <div className='px-4 py-2 text-4xl font-bold text-center rounded-xl flex flex-col items-center bg-pink-700'>
                    <img src={logo} alt="" className='size-20'/>
                    <h1>Tic Tac Toe</h1>
                </div>

                <div className='p-2 flex flex-col items-center w-8/12 sm:w-6/12 md:w-4/12 lg:2/12 gap-y-3'>

                    <button className='w-full p-2 rounded-xl bg-neutral-600 transition-all hover:bg-pink-700' onClick={()=>setShowInput(prev=>!prev)}>Create or Join a room</button>

                    <div className={`w-full p-2 bg-neutral-600 rounded-xl ${!showInput ? "hidden" : ""}`}>

                        <form onSubmit={!loading ? setCustomRoom : (e)=>{e.preventDefault();}} className='flex flex-col gap-2'>
                            <input type="text" value={uname} onChange={(e)=>{setUname(String(e.target.value))}} name="userName" id="userName" className='rounded-lg text-black px-3 leading-10 w-full placeholder:text-center' placeholder='Enter your name'/>
                            <div className='flex w-full gap-2'>
                                <input type="text" value={rname} onChange={(e)=>{setRname(String(e.target.value))}} name="roomName" id="roomName" className='rounded-lg text-black px-3 leading-10 placeholder:text-center w-3/4' placeholder='Enter room name'/>
                                <button type="submit" className={`p-2 bg-pink-700 hover:bg-pink-800 rounded-lg w-1/4 ${loading ? " cursor-not-allowed" : "cursor-pointer"}`}>Join</button>
                            </div>
                        </form>
                    </div>
                    <div>{loading ? "Attempting to connect..." : ""}</div>

                    {/* <button className='w-full p-2 rounded-xl bg-neutral-600 transition-all hover:bg-pink-700' onClick={setRandomGame}>Play with random</button> */}

                    {/* <>
                        <div className='flex gap-3'>
                            <h1>Waiting</h1>
                            <button onClick={disconnect} className='bg-neutral-600 py-1 px-2 text-sm rounded-xl'>
                                Leave room &nbsp;<IoExit size={30} className='inline text-pink-700'/>
                            </button>
                        </div>
                    </> */}

                </div>
                <ToastContainer/>
            </div>
        )
    }


    return (
        <div className='min-h-screen min-w-full bg-neutral-800 text-white '>

            <nav className='flex flex-row-reverse justify-between items-center relative px-5'>
                <div className=''>
                    <button onClick={disconnect} className='bg-neutral-600 py-1 px-2 text-sm rounded-xl'>
                        Leave room &nbsp;<IoExit size={30} className='inline text-pink-700'/>
                    </button>
                </div>

                <div className=' flex flex-col gap-1 p-2 rounded-lg'>
                    <div className='px-2 py-1 gap-1 rounded-lg'>
                        Room Name: {roomName}
                    </div>
                    <div className=' flex items-center gap-1'>
                        <div className='flex px-2 py-1 gap-1 bg-neutral-600 rounded-lg'>
                            <img src={playerOne} alt="" className='size-6'/>
                            <h2>{myName} (You)</h2>
                        </div>
                        <div className='px-2 py-1 gap-1 bg-neutral-600 rounded-lg'>{win}</div>
                    </div>
                    <div className='flex'>{waiting ? "Waiting..." : <div className='flex gap-1'>
                        <div className='flex px-2 py-1 gap-1 bg-neutral-600 rounded-lg text-center'>
                            <img src={playerTwo} alt="" className='size-6'/>
                            <h2>{opponentName}</h2>
                        </div>
                        <div className='px-2 py-1 gap-1 bg-neutral-600 rounded-lg text-center'>{lost}</div>
                    </div>}</div>
                </div>
            </nav>
            
            <div className='text-xl text-center'>Game {gameCount}</div>

            <div className='min-h-screen min-w-full flex items-center justify-center'>
                <div className='p-2 flex flex-col'>

                    

                    

                    <div className='flex flex-col items-center sm:flex-row sm:items-end gap-4'>
                        <div>
                            <div className='flex justify-between mb-10'>
                                <div className={`bg-neutral-600 min-w-28 text-center p-2 rounded-2xl rounded-tl-none ${!turn ? "bg-pink-700" : ""}`}>
                                    {opponentName}'s turn
                                </div>
                                <div className={`bg-neutral-600 min-w-28 text-center p-2 rounded-2xl rounded-br-none ${turn ? "bg-pink-700" : ""}`}>
                                    Your turn
                                </div>
                            </div>
                            <h1 className='bg-neutral-600 p-2 text-2xl mb-2 font-bold rounded-2xl text-center m-0.5'>Tic Tac Toe</h1>
                            <div className='grid grid-cols-3'>
                                {arr.flat().map(i=>(
                                    <Square key={i} position={i} myID={myID} gameState={gameState} setGameState={setGameState} gameResult={gameResult} waiting={waiting} turn={turn}/>
                                ))}
                            </div>
                        </div>
                        <div className='p-1'>
                            <div className='h-96 w-64 rounded-lg bg-neutral-600 relative p-2 flex flex-col gap-2 justify-end'>
                                <div className='flex flex-col gap-1 overflow-scroll'>
                                    {chat.length>0 ? chat.map(data=>(
                                        data[0]=='sent' || data[0]=='recieved' ? <div key={data[1]} className={`rounded-2xl px-2 py-1 w-1/2 leading-8 ${data[0]=='sent' ? "rounded-br-none bg-pink-700 self-end" : "rounded-tl-none bg-neutral-800 self-start"}`}>{data[1]}</div> : <></>
                                    )) : <></>}
                                </div>
                                <div className='flex gap-1'>
                                    <input type='text' value={txt} onChange={(e)=>setTxt(String(e.target.value))} className={`w-10/12 h-10 rounded-lg bg-neutral-800 px-2 ${waiting ? "cursor-not-allowed" : ""}`} placeholder='Type here...' readOnly={waiting ? true : false}/>
                                    <button onClick={waiting ? ()=>{} : sendMessage} className={`rounded-lg bg-pink-700 p-1 w-2/12 flex justify-center items-center hover:bg-pink-600 ${waiting ? "cursor-not-allowed hover:bg-pink-700" : ""}`}><IoMdSend size={20}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 justify-center items-center'>
                        <div className='text-center mt-5 text-xl'>
                            {gameResult}
                        </div>
                        <button onClick={restartGame} className={`px-2 py-1 rounded-lg bg-pink-700 ${!gameResult ? "hidden" : ""}`}>Play Again</button>
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}

export default App;