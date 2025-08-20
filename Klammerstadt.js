const inputFeld = document.getElementById('inputBox');
const guesses = document.getElementById('guesses');
const puzzleTextField = document.getElementById('puzzleText');
var levels = document.getElementById('levels');



let puzzleText = "standard puzzle text";
let gesamtlösung = null;
let frageAntwortArr = null;
let JSONdata = null;

let gelösteKlammern = [];


function parseNewGuess() {
	// guessesString = inputFeld.value + "<br />" + guessesString;
	// guesses.innerHTML = guessesString;
	// inputFeld.value = '';

	

	guesses.innerHTML = solvedBracketsToSTring();
}

function solvedBracketsToSTring() {
	return gelösteKlammern
		.map(([question, solution]) => `${question}: ${solution}`)
		.join('<br />');
}

function displayPuzzleText() {
	puzzleTextField.innerText = puzzleText;
}

function loadJSON(file){
	fetch(file)
		.then(response => response.json())
		.then(data => {
			JSONdata = data;
			puzzleText = data.rätsel;
			gesamtlösung = data.gesamtlösung;
			frageAntwortArr = data.frageAntwort.map(obj => [obj.frage, obj.antwort]);
			displayPuzzleText();
		})
		.catch(error => {
			console.error('Error loading JSON:', error);
		});
	
}

function getInnerBracketIndices(string){
	let result = [];
	let stack = [];

	for (let i = 0; i < string.length; i++) {
		if (string[i] === '[') {
			stack.push(i);
		} else if (string[i] === ']') {
			let openIndex = stack.pop();
			if (openIndex !== undefined) {
				// Check if there are no other brackets inside
				let inner = string.slice(openIndex + 1, i);
				if (!inner.includes('[') && !inner.includes(']')) {
					result.push([openIndex, i]);
				}
			}
		}
	}
	return result;
}





inputFeld.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();

		parseNewGuess();
		inputFeld.focus();
	}
});


// puzzleText = Jauthor;
console.log( "start test");

loadJSON('raetsel1.json');

let str = "[a[b[c]def[gasd[hallo]sd]]jkasfdjk]";
let innnerIndices = getInnerBracketIndices(str);
innnerIndices.forEach(([start, end]) => {
	console.log(str.substring(start, end + 1));
});


// console.log(Jpuzzle)
// displayPuzzleText();

console.log("test done");