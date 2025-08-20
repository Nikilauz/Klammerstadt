const inputFeld = document.getElementById('inputBox');
const guesses = document.getElementById('guesses');
var levels = document.getElementById('levels');
const puzzleTextField = document.getElementById('puzzleText');

let guessesString = "";

let puzzleText = "Klamm[erst]adt"; //TODO: aus Datei einlesen


inputFeld.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();

		readAndDisplay();
		inputFeld.focus();
	}
});



inputFeld.focus();

function readAndDisplay() {
	guessesString = inputFeld.value + "<br />" + guessesString;
	guesses.innerHTML = guessesString;
	inputFeld.value = '';
}

function ksBit(phrase, solution, start, end, kids) {
	this.phrase = phrase; // the puzzle
	this.solution = solution; // the solution
	this.start = start; // start and end position in parent ksBit.
	this.end = end;
	this.kids = kids;
}

function displayPuzzleText() {
	let displayString = "";
	
	
	//iterate over String and highlight the "leaf"-backets.
	let firstUnmarkedIndex = 0
	//iterate over whole text
	for(let i = 0; i < puzzleText.length; i++) {
		
	}
	
	
	puzzleTextField.innerHTML = displayString;
}