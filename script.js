//const statusDisplay = document.querySelector('.g_status');
const assessmentDisplay = document.querySelector('.g_assessment');
const diffDisplay = document.querySelector('.diff_val');

let gameActive;
let currentPlayer;
let gameState;
let model;
let diff = 4;

// Message generating functions
const currText = () => `${currentPlayer === 1 ? "X" : "O"}`;
const winningMessage = () => `Player ${currText()} wins!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currText()}'s turn`;

init()

async function init()
{
	// Load the model
	await loadAgent(diff)
	
	// Start the game
	handleRestartGame()
}

async function loadAgent(diff)
{
	switch(diff)
	{
		case 0:
			model = await tf.loadLayersModel('model/5000/model.json');
			diffDisplay.innerHTML = "5000"
			break;
		case 1:
			model = await tf.loadLayersModel('model/20000/model.json');
			diffDisplay.innerHTML = "20000"
			break;
		case 2:
			model = await tf.loadLayersModel('model/45x200/model.json');
			diffDisplay.innerHTML = "9000 Self-Play (Steps of 200)"
			break;
		case 3:
			model = await tf.loadLayersModel('model/100x200/model.json');
			diffDisplay.innerHTML = "20000 Self-Play (Steps of 200)"
			break;
		case 4:
			model = await tf.loadLayersModel('model/40000/model.json');
			diffDisplay.innerHTML = "40000"
			break;
	}
}

async function diffUp()
{
	if(++diff > 4)
	{
		diff--
	}
	else
	{
		await loadAgent(diff)
	}
	
	assessmentDisplay.value = 100 * model.predict(tf.tensor([gameState])).dataSync();
}

async function diffDown()
{
	if(--diff < 0)
	{
		diff++
	}
	else
	{
		await loadAgent(diff)
	}
	
	assessmentDisplay.value = 100 * model.predict(tf.tensor([gameState])).dataSync();
}

function computerMove()
{
	if(!gameActive)
		return;
	
	let bestE = -1;
	let best = -1;
	let pred;
	let mGameState;
	
	for(let i = 0; i <= 2; i++)
	{
		for(let j = 0; j <= 2; j++)
		{
			if(gameState[i][j] === 0)
			{
				// This line is really annoying
				mGameState = JSON.parse(JSON.stringify(gameState));
				mGameState[i][j] = currentPlayer;
				pred = currentPlayer * model.predict(tf.tensor([mGameState])).dataSync();
				console.log(JSON.parse(JSON.stringify(mGameState)))
				console.log(pred)
				if(pred > bestE)
				{
					bestE = pred;
					best = 3 * i + j;
				}
			}
		}
	}
	if(best === -1)
		return;
	
	const cell = document.querySelectorAll('.cell')[best]
	const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
	
	// Make the move
	handleCellPlayed(cell, cellIndex);
	handleResultValidation();
}

function handleCellPlayed(clickedCell, clickedCellIndex)
{
	// Set the state of the cell and update gameState
	gameState[Math.floor(clickedCellIndex/3)][clickedCellIndex % 3] = currentPlayer;
	clickedCell.innerHTML = currentPlayer === 1 ? "X" : "O";
}

function handlePlayerChange()
{
	currentPlayer = currentPlayer === 1 ? -1 : 1;
}


// Rework - Check
const winningConditions = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];
function handleResultValidation() {
	let roundWon = false;
	
	assessmentDisplay.value = 100 * model.predict(tf.tensor([gameState])).dataSync();
	
	for (let i = 0; i <= 7; i++)
	{
		const winCondition = winningConditions[i];
		let a = gameState[Math.floor(winCondition[0]/3)][winCondition[0] % 3];
		let b = gameState[Math.floor(winCondition[1]/3)][winCondition[1] % 3];
		let c = gameState[Math.floor(winCondition[2]/3)][winCondition[2] % 3];
		if (a === 0 || b === 0 || c === 0)
		{
			continue;
		}
		if (a === b && b === c)
		{
			roundWon = true;
			break
		}
	}
	if (roundWon)
	{
		gameActive = false;
		return;
	}
		
		let roundDraw = !gameState[0].includes(0) && !gameState[1].includes(0) && !gameState[2].includes(0);
		if (roundDraw)
		{
			gameActive = false;
			return;
		}
		
		handlePlayerChange();
}

function handleCellClick(clickedCellEvent)
{
	const clickedCell = clickedCellEvent.target;
	
	// Determine the cell's position
	const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

	// Return if cell cannot be played
	if (gameState[Math.floor(clickedCellIndex/3)][clickedCellIndex % 3] !== 0 || !gameActive)
	{
		return;
	}
	
	// Perform the necessary changes
	handleCellPlayed(clickedCell, clickedCellIndex);
	handleResultValidation();
}

function handleRestartGame()
{
	gameActive = true;
	currentPlayer = 1;
	gameState = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
	document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
	
	assessmentDisplay.value = 100 * model.predict(tf.tensor([gameState])).dataSync();
}

// Listeners
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.g_restart').addEventListener('click', init);
document.querySelector('.g_computer').addEventListener('click', computerMove);
document.querySelector('.diff_up').addEventListener('click', diffUp);
document.querySelector('.diff_down').addEventListener('click', diffDown);
