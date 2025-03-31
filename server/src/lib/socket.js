import { Server } from 'socket.io'

let ioInstance = null

export function initSocket(server) {
	if (!ioInstance) {
		ioInstance = new Server(server, {
			cors: {
				origin: '*',
				methods: ['GET', 'POST'],
			},
		})
	}
	return ioInstance
}

export function getIO() {
	if (!ioInstance) {
		throw new Error('Socket.io not initialized!')
	}
	return ioInstance
}
