const statusDisplay = document.querySelector('.g_status');

(async() => {
const model = await tf.loadLayersModel('/model/model.json');
})();

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];

// Message generating functions
const winningMessage = () => `Player ${currentPlayer} wins!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

statusDisplay.innerHTML = currentPlayerTurn();

function handleCellPlayed(clickedCell, clickedCellIndex)
{
	// Set the state of the cell and update gameState
	gameState[clickedCellIndex] = currentPlayer;
	clickedCell.innerHTML = currentPlayer;
}

function handlePlayerChange()
{
	currentPlayer = currentPlayer === "X" ? "O" : "X";
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
	for (let i = 0; i <= 7; i++)
	{
		const winCondition = winningConditions[i];
		let a = gameState[winCondition[0]];
		let b = gameState[winCondition[1]];
		let c = gameState[winCondition[2]];
		if (a === '' || b === '' || c === '')
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
		
		let roundDraw = !gameState.includes("");
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
	if (gameState[clickedCellIndex] !== "" || !gameActive)
	{
		return;
	}
	
	handleCellPlayed(clickedCell, clickedCellIndex);
	handleResultValidation();
}

function handleRestartGame()
{
	gameActive = true;
	currentPlayer = "X";
	gameState = ["", "", "", "", "", "", "", "", ""];
	statusDisplay.innerHTML = currentPlayerTurn();
	document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
}
/*
And finally we add our event listeners to the actual game cells, as well as our 
restart button
*/
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.g_restart').addEventListener('click', handleRestartGame);
