import { io } from 'socket.io-client';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const socket = io(SERVER, { autoConnect: true });

export default socket;
