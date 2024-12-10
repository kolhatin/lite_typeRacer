const socket = io();
const createRaceBtn = document.getElementById('createRaceBtn');
const joinRaceBtn = document.getElementById('joinRaceBtn');
const raceIdInput = document.getElementById('raceIdInput');
const TypoText = document.getElementById('TypoText');
const nickIdInput = document.getElementById('nickIdInput');
const savedNick = localStorage.getItem('nickname');
if (savedNick) {
    nickIdInput.value = savedNick;
}


const gameDiv = document.getElementById('game');
const rezDiv = document.getElementById('rezult');


let raceData = null;
let roomText = null;
let temp_p = 0;

createRaceBtn.addEventListener('click', () => {
	const lang = document.getElementById('langSelect').value;
    socket.emit('createRace', lang);
});

joinRaceBtn.addEventListener('click', () => {
    const raceId = raceIdInput.value.trim();
	const nickname = nickIdInput.value.trim();
	localStorage.setItem('nickname', nickname);
	
	TypoText.innerHTML="";
	roomText=null;
	temp_p = 0;
    if (raceId) {
        socket.emit('joinRace', raceId, nickname);
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
	if (!roomText){
		temp_p = 0;
		roomText = race.text;
		TypoText.innerHTML=roomText;
	}
    gameDiv.innerHTML = `
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
        </div>`
	rezDiv.innerHTML=`
        <p>Учасники:</p>
        <ul>
            ${race.players
                .map(
                    player => `
                <li>
                    ${player.id === socket.id ? '<strong>Ви</strong>: ' : ''} 
                    ${player.nick} - ${Math.round(player.progress)}% 
					${(player.wintime)? player.wintime : ''}
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
	const expectedText = roomText.slice(0, typedText.length);
	const coursorText = '<span class="cursor"></span>'

	if (typedText === expectedText) {
		typingInput.classList.remove("txtInput-error");
		errorMessage.textContent = ''; // Сбрасываем сообщение об ошибке
		position = (temp_p + typedText.length);
		
		const progress = (position / raceData.text.length) * 100;
		if (typedText.endsWith(' ') || roomText.length==typedText.length){
			roomText=roomText.slice(typedText.length);
			TypoText.innerHTML = TypoText.innerHTML.replace(typedText,"<span class='verify'>"+typedText+"</span>" );
			temp_p += typedText.length
			typingInput.value= "";
			if (!roomText){
				roomText=" "
			}
			
		}
		socket.emit('updateProgress', { raceId: raceData.id, progress });
	} else {
		typingInput.classList.add("txtInput-error");
		errorMessage.textContent = 'Incorrect input!';
	}
});