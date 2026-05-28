import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { 
  autoConnect: false, // Keeps connection off until user state is verified
  withCredentials: true 
});

export default socket;