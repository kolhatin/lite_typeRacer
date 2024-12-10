const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const races = {};

// Статическая папка
app.use(express.static('public'));

// Генерация текста для набора
const generateText = () => "The quick brown fox jumps over the lazy dog.";

// События WebSocket
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Пользователь создает гонку
    socket.on('createRace', () => {
        const raceId = getRandomInt(1000,10000)+'';
        races[raceId] = {
            id: raceId,
            players: [],
            text: generateText(),
        };
        socket.join(raceId);
		console.log(`User ${socket.id} create race: ${raceId}`);
        socket.emit('raceCreated', races[raceId]);
    });

    // Пользователь подключается к гонке
    socket.on('joinRace', (raceId) => {
        if (races[raceId]) {
            socket.join(raceId);
			console.log(`User ${socket.id} join to race: ${raceId}`);
            races[raceId].players.push({ id: socket.id, progress: 0 });
            io.in(raceId).emit('raceUpdated', races[raceId]);
        } else {
            socket.emit('error', 'Race not found');
        }
    });

    // Обновление прогресса игрока
    socket.on('updateProgress', ({ raceId, progress }) => {
		const race = races[raceId];
		console.log(io.of("/").adapter.rooms)
        if (race) {
            const player = race.players.find(p => p.id === socket.id);
            if (player) {
                player.progress = progress;
				console.log(player);
                io.in(raceId).emit('raceUpdated', race);
            }
        }
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const raceId in races) {
            races[raceId].players = races[raceId].players.filter(p => p.id !== socket.id);
            io.in(raceId).emit('raceUpdated', races[raceId]);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}