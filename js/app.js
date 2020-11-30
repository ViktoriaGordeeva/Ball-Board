const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG = '<img src="img/gamer-purple.png" />';

var gBoard;
var gGamerPos;
var gInterval;
var gGlueInterval;
var ballsNum = 7;
var ballsCounter = 0; //5
var collectedBalls = 0;
var gGlue = false;

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gInterval = setInterval(randomBall, 3000);
	gGlueInterval = setInterval(randomGlue, 5000);
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };
			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			if (i === 0 && j === 5 || i === board.length - 1 && j === 5 || i === 5 && j === 0 || i === 5 && j === board[0].length - 1) {
				cell.type = FLOOR;
			}
			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;
	// console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// change to short if statement
			currCell.type === FLOOR ? cellClass += ' floor' : cellClass += ' wall'
			// else if (currCell.type === WALL) cellClass += ' wall';

			// Change To template string
			strHTML += `\t<td class="cell ${cellClass} "  onclick="moveTo(${i},${j})" >\n`; //i and j from modal

			// change to switch case statement
			switch (currCell.gameElement) {
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
			}

		}
		// if (currCell.gameElement === GAMER) {
		// 	strHTML += GAMER_IMG;
		// } else if (currCell.gameElement === BALL) {
		// 	strHTML += BALL_IMG;
		// }

		strHTML += '\t</td>\n';
	}
	strHTML += '</tr>\n';


	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gGlue) return;
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			playSound();
			collectedBalls++;
			document.querySelector('.count').innerText = 'Collected balls:' + collectedBalls;
			if (collectedBalls === ballsNum) document.querySelector('.victory').style.display = "block"
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		//Specific cells:
		if (i === 0 && j === 5) {
			i = gBoard.length - 1;
			j = j;
		} else if (i === gBoard.length - 1 && j === 5) {
			i = 0;
			j = j;
		} else if (i === 5 && j === 0) {
			i = i;
			j = gBoard[0].length - 1;
		} else if (i === 5 && j === gBoard[0].length - 1) {
			i = i;
			j = 0;
		}

		if (targetCell.gameElement === GLUE) {
			gGlue = true;
			setTimeout(function () {
				gGlue = false;
			}, 3000)
		}
		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);


	}
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) { //location - object
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function randomBall() {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	while (gBoard[i][j].gameElement !== null) {
		i = getRandomInt(1, gBoard.length - 1);
		j = getRandomInt(1, gBoard[0].length - 1);
	}
	//model:
	gBoard[i][j].gameElement = BALL;
	//DOM
	renderCell({ i: i, j: j }, BALL_IMG)
	ballsCounter++;
	if (ballsCounter === ballsNum - 2) clearInterval(gInterval);

}
function randomGlue() {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	while (gBoard[i][j].gameElement !== null) {
		i = getRandomInt(1, gBoard.length - 1);
		j = getRandomInt(1, gBoard[0].length - 1);
	}
	//model:
	gBoard[i][j].gameElement = GLUE;
	//DOM
	renderCell({ i: i, j: j }, GLUE_IMG)
	setTimeout(function () {
		gBoard[i][j].gameElement = null;
		renderCell({ i: i, j: j }, '')
	}, 3000)
}

function restart() {
	document.querySelector('.victory').style.display = "none";
	collectedBalls = 0;
	document.querySelector('.count').innerText = '';
	ballsCounter = 0;
	initGame();
}

function playSound() {
	var sound = new Audio('sounds/pop.wav');
	sound.play()
}
