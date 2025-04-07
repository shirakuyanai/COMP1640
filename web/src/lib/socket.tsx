import io from 'socket.io-client'

let socket: any

export const initializeSocket = (username: string) => {
	if (!socket) {
		socket = io(import.meta.env.VITE_HOST, {
			transports: ['websocket'],
			auth: { username },
		})
	}
	return socket
}

export const getSocket = () => socket
