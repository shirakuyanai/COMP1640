import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './config/db_config.js';
import {
    alreadyLoggedIn,
    authenticateApp,
    staffOnly,
    authenticateToken,
    Login,
} from './lib/auth.js';
import { getLoggedInUser } from './db/user.js';
import { getClassById, getDataForCreatingClass, addNewClass } from './db/class.js';
import { getConversation, getMessagesOfConversation, saveMessage } from './db/message.js';
import studentRoutes from './routes/studentRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: JSON.parse(process.env.ALLOWED_HOSTS ?? '[]'), credentials: true }));
app.enable('trust proxy');

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

const usersSockets = {};

connectToDatabase().then(() => {
    io.use((socket, next) => {
        const username = socket.handshake.auth.username;
        console.log(`user ${username} connected`);
        delete usersSockets[username];
        usersSockets[username] = socket.id;
        socket.username = username;
        next();
    });

    io.on('connection', (socket) => {
        socket.on('sendMessage', async (messageData) => {
            if (messageData.room) {
                const savedMessage = await saveMessage({
                    conversationId: messageData.message.conversationId,
                    senderId: messageData.message.senderId,
                    messageContent: messageData.message.messageContent,
                });
                socket.broadcast.to(messageData.room).emit('receiveMessage', messageData.message);
            } else {
                io.emit('receiveMessage', messageData.message);
            }
        });

        socket.on('connectToUser', (recipient) => {
            const room = [socket.username, recipient].sort().join('-');
            io.to(usersSockets[recipient]).emit('receiveInvitation', room);
            io.to(socket.id).emit('receiveInvitation', room);
        });

        socket.on('joinRoom', (room) => {
            socket.room = room;
            socket.join(room);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
            delete usersSockets[socket.username];
        });
    });

    app.use('/api/students', studentRoutes);
    app.use('/api/meetings', meetingRoutes);

    app.get('/', (req, res) => res.json('Congratulations, your server is up and running!'));

    app.post('/login', authenticateApp, alreadyLoggedIn, async (req, res) => {
        const response = await Login(req, res);
        res.status(response.status).json(response.item);
    });

    app.get('/getDataForCreatingClass', authenticateApp, authenticateToken, staffOnly, async (req, res) => {
        const response = await getDataForCreatingClass();
        res.status(response.status).json(response.item);
    });

    app.post('/addNewClass', authenticateApp, authenticateToken, staffOnly, async (req, res) => {
        const response = await addNewClass({
            studentId: req.body.studentId,
            tutorId: req.body.tutorId,
            className: req.body.className,
        });
        res.status(response.status).json(response.item);
    });

    app.post('/getMessages', authenticateApp, authenticateToken, async (req, res) => {
        const response = await getMessagesOfConversation(req.body);
        res.status(response.status).json(response.item);
    });

    app.post('/getConversation', authenticateApp, authenticateToken, async (req, res) => {
        const response = await getConversation(req.body);
        res.status(response.status).json(response.item);
    });

    app.get('/getCurrentUser', authenticateApp, authenticateToken, async (req, res) => {
        const response = await getLoggedInUser(req, res);
        res.status(response.status).json(response.item);
    });

    app.get('/getClassById/:classId', authenticateApp, authenticateToken, async (req, res) => {
        const response = await getClassById(req.params.classId);
        res.status(response.status).json(response.item);
    });

    server.listen(PORT, () => console.log(`listening on port ${PORT}`));
});
