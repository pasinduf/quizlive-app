import { io } from 'socket.io-client';

const socket = io("/", {
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;
