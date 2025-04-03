import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

const socket = io('import.meta.env.VITE_HOST') 

const VideoChatPage = () => {
	const localVideoRef = useRef<HTMLVideoElement>(null)
	const remoteVideoRef = useRef<HTMLVideoElement>(null)
	const peerRef = useRef<RTCPeerConnection | null>(null)
	const [joined, setJoined] = useState(false)

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream
				}

				peerRef.current = new RTCPeerConnection()

				stream.getTracks().forEach((track) => {
					peerRef.current?.addTrack(track, stream)
				})

				peerRef.current.ontrack = (event) => {
					if (remoteVideoRef.current) {
						remoteVideoRef.current.srcObject = event.streams[0]
					}
				}

				peerRef.current.onicecandidate = (event) => {
					if (event.candidate) {
						socket.emit('ice-candidate', event.candidate)
					}
				}
			})

		socket.on('offer', async (offer) => {
			if (!peerRef.current) return
			await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer))
			const answer = await peerRef.current.createAnswer()
			await peerRef.current.setLocalDescription(answer)
			socket.emit('answer', answer)
		})

		socket.on('answer', async (answer) => {
			await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
		})

		socket.on('ice-candidate', async (candidate) => {
			try {
				await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
			} catch (err) {
				console.error('Failed to add ICE candidate:', err)
			}
		})
	}, [])

	const startCall = async () => {
		if (!peerRef.current) return
		const offer = await peerRef.current.createOffer()
		await peerRef.current.setLocalDescription(offer)
		socket.emit('offer', offer)
		setJoined(true)
	}

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold mb-4'>Video Chat (P2P via WebRTC)</h1>

			<div className='grid grid-cols-2 gap-6'>
				<div>
					<h2 className='font-semibold mb-2'>🎥 You</h2>
					<video ref={localVideoRef} autoPlay muted className='rounded shadow' />
				</div>
				<div>
					<h2 className='font-semibold mb-2'>👥 Peer</h2>
					<video ref={remoteVideoRef} autoPlay className='rounded shadow' />
				</div>
			</div>

			{!joined && (
				<button
					onClick={startCall}
					className='mt-6 bg-blue-600 text-white px-4 py-2 rounded shadow'
				>
					Start Call
				</button>
			)}
		</div>
	)
}

export default VideoChatPage
