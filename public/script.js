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
    displayRace(race);
});

function displayRace(race) {
    raceData = race;
    gameDiv.innerHTML = `
        <p>Text: ${race.text}</p>
        <p>Players:</p>
        <ul>
            ${race.players.map(player => `<li>${player.id}: ${player.progress}%</li>`).join('')}
        </ul>
    `;
    // Добавляем поле ввода для участника
    if (race.players.some(p => p.id === socket.id)) {
        gameDiv.innerHTML += `
            <input  placeholder="Start typing here..." />
			<input id="typingInput" type="text" class="txtInput" autocorrect="off" autocapitalize="off" maxlength="16">
            <p id="errorMessage" style="color: red;"></p>
        `;
        const typingInput = document.getElementById('typingInput');
        const errorMessage = document.getElementById('errorMessage');
        
        typingInput.addEventListener('input', () => {
            const typedText = typingInput.value;
            const expectedText = race.text.slice(0, typedText.length);

            if (typedText === expectedText) {
                errorMessage.textContent = ''; // Сбрасываем сообщение об ошибке
                const progress = (typedText.length / race.text.length) * 100;
                socket.emit('updateProgress', { raceId: race.id, progress });
            } else {
                errorMessage.textContent = 'Incorrect input!';
            }
        });
    }
}