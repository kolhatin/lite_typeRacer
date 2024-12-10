const socket = io();
const createRaceBtn = document.getElementById('createRaceBtn');
const joinRaceBtn = document.getElementById('joinRaceBtn');
const raceIdInput = document.getElementById('raceIdInput');
const gameDiv = document.getElementById('game');

let raceData = null;

createRaceBtn.addEventListener('click', () => {
    socket.emit('createRace');
});

joinRaceBtn.addEventListener('click', () => {
    const raceId = raceIdInput.value.trim();
    if (raceId) {
        socket.emit('joinRace', raceId);
    }
});

socket.on('raceCreated', (race) => {
    alert(`Race created! ID: ${race.id}`);
    displayRace(race);
});

socket.on('raceUpdated', (race) => {
    console.log(race);
	displayRace(race);
	
});

function displayRace(race) {
    raceData = race;
    gameDiv.innerHTML = `
        <p>Text: ${race.text}</p>
        <div id="tracks">
            ${race.players
                .map(
                    (player, index) => `
                <div class="track">
                    <div 
                        class="car ${player.id === socket.id ? 'current-player' : ''}" 
                        id="car-${index}"  >
                    </div>
                </div>
            `
                )
                .join('')}
        </div>
        <p>Players:</p>
        <ul>
            ${race.players
                .map(
                    player => `
                <li>
                    ${player.id === socket.id ? '<strong>Вы</strong>: ' : ''} 
                    ${player.id} - ${Math.round(player.progress)}%
                </li>
            `
                )
                .join('')}
        </ul>
    `;
	
	race.players.forEach((player, index) => {
        const car = document.getElementById(`car-${index}`);
        if (car) {
            const progress = Math.min(player.progress, 100); // Обмежуємо до 100%
            car.style.left = `${progress}%`;
			
        }
    });
	
}

const typingInput = document.getElementById('typingInput');
const errorMessage = document.getElementById('errorMessage');
        
typingInput.addEventListener('input', () => {
	const typedText = typingInput.value;
	const expectedText = raceData.text.slice(0, typedText.length);

	if (typedText === expectedText) {
		errorMessage.textContent = ''; // Сбрасываем сообщение об ошибке
		const progress = (typedText.length / raceData.text.length) * 100;
		socket.emit('updateProgress', { raceId: raceData.id, progress });
	} else {
		errorMessage.textContent = 'Incorrect input!';
	}
});