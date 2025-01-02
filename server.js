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


const texts_uah = [
    "Лисичка вирішила покликати Журавля в гості. Зварила вона кашу з пшона, поклала її на тарілку та запросила: 'Приходь, Журавлику, на обід!'",
    "Кирило був дужий і відважний чоловік. Як почув про змія, то сказав: 'Треба йти й побороти зло, бо воно не дає людям жити спокійно.'",
    "Хуха-Моховинка жила в дуплі старого дуба. Вона була маленька, пухнаста та доброзичлива. Одного дня люди вирубали її дерево, і вона пішла шукати новий дім.",
    "Муха-Цокотуха знайшла гроші та вирішила влаштувати свято. Вона запросила всіх своїх друзів на бенкет, але раптом з'явився злий павук.",
    "На полі зацвів Соняшник. Його пелюстки розкрилися до сонця. Але одного разу Соняшник замислився: 'Чому я завжди тягнуся до світла?'",
    "Маленький дзвіночок жив у лісі. Він радів кожному вітерцю, який грався з його синіми пелюстками.",
    "Ворона знала, що сила не в гніві, а в мудрості. Коли інші птахи сперечалися, вона завжди знаходила правильне слово.",
    "Жила собі коза-Дереза, яка любила хитрувати. Її господарі вигнали за те, що вона обманювала всіх у дворі.",
    "Курочка знесла золоте яєчко. Дід бив – не розбив, баба била – не розбила. А мишка бігла, хвостиком зачепила, і яєчко впало й розбилося.",
    "Котик і Півник жили в одній хаті. Котик казав: 'Будь обережний, Півнику, не відчиняй двері Лисичці!'"
];

const texts_en=[
	"The cat is sitting on the mat.",
    "A dog ran quickly through the park.",
    "It is a sunny day outside.",
    "She likes to read books every evening.",
    "The bird is singing in the tree.",
    "Tom and Jerry are best friends.",
    "Apples and bananas are my favorite fruits.",
    "The boy is playing with a ball.",
    "Look at the stars shining in the sky.",
    "We love to watch cartoons together.",
    "The car stopped at the red light.",
    "There is a big tree in the garden.",
    "The little girl is drawing a picture.",
    "John has a blue bike and rides it every day.",
    "We went to the zoo and saw a lion."
];
const texts_enh=[
    "The sun was shining brightly, and the birds were singing in the trees. It was a perfect day for a walk in the park.",
    "Tom found a little kitten near his house. He gave it some milk, and the kitten purred happily.",
    "Lucy loves to read fairy tales every night before bed. Her favorite story is about a brave knight and a dragon.",
    "The children played soccer in the yard. They laughed and cheered as the ball flew into the goal.",
    "Anna baked cookies with her grandmother. The kitchen smelled like chocolate and vanilla.",
    "It started raining, but Jack didn’t mind. He put on his boots and splashed in the puddles.",
    "Sara planted flowers in the garden. After a few weeks, they bloomed with bright colors.",
    "John and his sister built a snowman in the backyard. They gave it a carrot nose and a scarf.",
    "A little bird flew into the classroom. The teacher gently opened the window, and the bird flew away.",
    "The dog was wagging its tail as it waited for its owner. When the boy came back, the dog jumped with joy."
];


const texts_uae = [
    "Сонце світить на небі.",
    "Діти грають у футбол.",
    "Кіт сидить на вікні.",
    "Мама готує смачний обід.",
    "Пташка співає на дереві.",
    "Ми любимо читати книжки.",
    "Тато купив новий велосипед.",
    "На полі ростуть гарні квіти.",
    "Хлопчик малює кольоровими олівцями.",
    "Дівчинка любить їсти яблука.",
    "У школі діти пишуть контрольну роботу.",
    "На вулиці тепла погода.",
    "Собака біжить за м'ячем.",
    "Маленький хлопчик тримає повітряну кульку.",
    "Моя сестра співає гарну пісню."
];

// Генерация текста для набора
function generateText(lang) {
    let randomIndex = 0;
	switch(lang){
		case 'uae':
			randomIndex = Math.floor(Math.random() * texts_uae.length);
			return texts_uae[randomIndex];
		case 'uah':
			randomIndex = Math.floor(Math.random() * texts_uah.length);
			return texts_uah[randomIndex];
		case 'en':
			randomIndex = Math.floor(Math.random() * texts_en.length);
			return texts_en[randomIndex];
		case 'enh':
			randomIndex = Math.floor(Math.random() * texts_enh.length);
			return texts_enh[randomIndex];
		default:
			return "Please select a valid language or category.";
	}
	
}


// События WebSocket
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Пользователь создает гонку
    socket.on('createRace', (lang) => {
        const raceId = getRandomInt(1000,10000)+'';
        races[raceId] = {
            id: raceId,
            players: [],
            text: generateText(lang),
        };
        socket.join(raceId);
        socket.emit('raceCreated', races[raceId]);
    });

    // Пользователь подключается к гонке
    socket.on('joinRace', (raceId, nickname) => {
        if (races[raceId]) {
            socket.join(raceId);
			races[raceId].players.push({ id: socket.id, nick: nickname, progress: 0 });
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
				if (progress>=100){
					if (!player.wintime){
						player.wintime = Date().split(" ")[4];
					}
				}
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