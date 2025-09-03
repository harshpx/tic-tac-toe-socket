import { io } from "socket.io-client";

const SOCKET_ENDPOINT = "https://ttt.174.138.122.195.nip.io";
export const socket = io(SOCKET_ENDPOINT, {
  autoConnect: false,
});
