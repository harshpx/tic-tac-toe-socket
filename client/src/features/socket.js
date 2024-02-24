import {io} from 'socket.io-client';

const SOCKET_ENDPOINT = "https://tic-tac-toe-socket-api-9f03754f47c8.herokuapp.com/";
export const socket = io(SOCKET_ENDPOINT,{
    autoConnect: false
});