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
	
	// parse guess
	const guess = inputFeld.value.trim();
	if (!guess) return;

	// generate open questions
	const offeneFragen = getInnerBracketSubstrings(puzzleText);

	let gefundeneLösungen = []

	// check if guess is solution to open question
	if (frageAntwortArr) {
		const matches = frageAntwortArr.filter(([frage, antwort]) => antwort.toLowerCase() === guess.toLowerCase());
		matches.forEach(found => {
			// checken ob frage bereits lösbar ist
			if (offeneFragen.some(f => f.toLowerCase() === found[0].toLowerCase())) {
				gelösteKlammern.unshift(found);
				gefundeneLösungen.push(found);
			}
		});
	}

	// replace question with solution
	gefundeneLösungen.forEach(([frage, antwort]) => {
		const regex = new RegExp(`\\[${frage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'i');
		puzzleText = puzzleText.replace(regex, antwort);
	});
	displayPuzzleText();


	// update fields
	guesses.innerHTML = solvedBracketsToSTring();

	checkForFullSolution();
	inputFeld.value = '';
	inputFeld.focus();
}

function checkForFullSolution(){
	if (puzzleText === JSONdata.gesamtlösung){
		puzzleText.join("<br />Juhuu, Rätsel gelöst! Das hat gar nicht lang gedauert...");
		displayPuzzleText();
	}
}

function solvedBracketsToSTring() {
	return gelösteKlammern
		.map(([question, solution]) => `${question}: ${solution}`)
		.join('<br />');
}

function displayPuzzleText() {
	let displayText = "";
	let innerIndices = getInnerBracketIndices(puzzleText);
	let lastEnd = 0;
	innerIndices.forEach(([start, end]) => {
		displayText += puzzleText.substring(lastEnd, start-1);
		displayText += "<mark>" + puzzleText.substring(start, end+1) + "</mark>";
		lastEnd = end;
	});
	puzzleTextField.innerHTML = displayText;
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

function getInnerBracketSubstrings(string) {
	const indices = getInnerBracketIndices(string);
	return indices.map(([start, end]) => string.substring(start + 1, end));
}

inputFeld.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();

		parseNewGuess();
		inputFeld.focus();
	}
});


// load file
loadJSON('raetsel/raetsel15.json');
inputFeld.focus();
