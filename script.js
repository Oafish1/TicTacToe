const statusDisplay = document.querySelector('.g_status');

const model = tf.loadLayersModel('model/model.json');

let gameActive = true;
let currentPlayer = 1;
let gameState = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

// Message generating functions
const currText = () => `${currentPlayer === 1 ? "X" : "O"}`;
const winningMessage = () => `Player ${currText()} wins!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currText()}'s turn`;

statusDisplay.innerHTML = currentPlayerTurn();

function handleCellPlayed(clickedCell, clickedCellIndex)
{
	// Set the state of the cell and update gameState
	gameState[Math.floor(clickedCellIndex/3)][clickedCellIndex % 3] = currentPlayer;
	clickedCell.innerHTML = currentPlayer === 1 ? "X" : "O";
}

function handlePlayerChange()
{
	currentPlayer = currentPlayer === 1 ? -1 : 1;
	statusDisplay.innerHTML = currentPlayerTurn();
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
	
	model.predict(tf.tensor(gameState));
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
		statusDisplay.innerHTML = winningMessage();
		gameActive = false;
		return;
	}
		
		let roundDraw = !gameState[0].includes(0) && !gameState[1].includes(0) && !gameState[2].includes(0);
		if (roundDraw)
		{
			statusDisplay.innerHTML = drawMessage();
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
	statusDisplay.innerHTML = currentPlayerTurn();
	document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
}
/*
And finally we add our event listeners to the actual game cells, as well as our 
restart button
*/
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.g_restart').addEventListener('click', handleRestartGame);
