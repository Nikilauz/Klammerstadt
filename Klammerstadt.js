const inputFeld = document.getElementById('inputBox');
const guesses = document.getElementById('guesses');
const puzzleTextField = document.getElementById('puzzleText');
var levels = document.getElementById('levels');



let guessesString = "";
let puzzleText = "Klamm[erst]adt"; //TODO: aus Datei einlesen



function readAndDisplay() {
	guessesString = inputFeld.value + "<br />" + guessesString;
	guesses.innerHTML = guessesString;
	inputFeld.value = '';
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


inputFeld.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();

		readAndDisplay();
		inputFeld.focus();
	}
});

inputFeld.focus();