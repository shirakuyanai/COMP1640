import io from 'socket.io-client'

let socket: any

export const initializeSocket = (username: string) => {
	if (!socket) {
		socket = io('http://localhost:5000', {
			transports: ['websocket'],
			auth: { username },
		})
	}
	return socket
}

export const getSocket = () => socket
