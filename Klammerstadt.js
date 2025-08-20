const inputFeld = document.getElementById('inputBox');
const guesses = document.getElementById('guesses');
const puzzleTextField = document.getElementById('puzzleText');
var levels = document.getElementById('levels');



let guessesString = "";
let puzzleText = "standard puzzle text";
let JSONdata = null;


function parseNewGuess() {
	guessesString = inputFeld.value + "<br />" + guessesString;
	guesses.innerHTML = guessesString;
	inputFeld.value = '';
}

function displayPuzzleText() {
	let displayText = "";
	leafBracketPositions = 
	for(int leafBracketIndex = 0; i < leafBrackets; i++) {
		
	}
	puzzleTextField.innerText = puzzleText;
}


inputFeld.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();

		parseNewGuess();
		inputFeld.focus();
	}
});

inputFeld.focus();


function loadJSON(file){
	fetch(file)
		.then(response => response.json())
		.then(data => {
			JSONdata = data;
			puzzleText = JSONdata.rätsel;
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


// puzzleText = Jauthor;
console.log("start test");

loadJSON('raetsel1.json');

let str = "[a[b[c]def[gasd[hallo]sd]]jkasfdjk]";
let innnerIndices = getInnerBracketIndices(str);
innnerIndices.forEach(([start, end]) => {
	console.log(str.substring(start, end + 1));
});


// console.log(Jpuzzle)
// displayPuzzleText();

console.log("test done");