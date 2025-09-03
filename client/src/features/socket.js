import { io } from "socket.io-client";

const SOCKET_ENDPOINT = "http://localhost:5002";
export const socket = io(SOCKET_ENDPOINT, {
  autoConnect: false,
});
