import React, { useEffect, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { FiCircle } from "react-icons/fi";
import decision from '../features/gameLogic.js';

import {socket as soc} from '../features/socket.js';

const Square = ({myID,position,gameState,setGameState,gameResult,waiting,turn}) => {

    const [icon,setIcon] = useState(null);
    // const [currState,setCurrState] = useState(gameState);

    useEffect(()=>{
        if(gameState[position]=='x') setIcon(<RxCross2 size={80}/>);
        else if(gameState[position]=='o') setIcon(<FiCircle size={80}/>);
        else setIcon(null);
    },[gameState])
    
    useEffect(()=>{
        soc.on('newState',(data)=>{
            setGameState(data);
            if(data[position]=='x') setIcon(<RxCross2 size={80}/>);
            else if(data[position]=='o') setIcon(<FiCircle size={80}/>);
            else setIcon(null);
        })
    },[soc])

    const mark = ()=>{

        if(!icon){
            if(myID==1){
                setIcon(<RxCross2 size={80}/>);
                const currState = [...gameState];
                currState[position] = 'x';
                soc.emit('move',currState);
                setGameState(currState);
            }else if(myID==2){
                setIcon(<FiCircle size={80}/>);
                const currState = [...gameState];
                currState[position] = 'o';
                soc.emit('move',currState);
                setGameState(currState);
            }
        }
    }

    return (
        <div className={`size-24  rounded-2xl m-1 flex items-center justify-center transition-all ${gameResult!='' || waiting || !turn ? "cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${gameResult!=='pending' && decision(gameState)[1]?.filter(val=>(val===position)).length>0 ? "bg-pink-700" : "bg-neutral-600"}`} onClick={gameResult!='' || waiting || !turn ? ()=>{} :  mark}>
            {icon}
        </div>
    )
}

export default Square;