const inputFeld = document.getElementById('inputBox');
const guesses = document.getElementById('guesses');
const puzzleTextField = document.getElementById('puzzleText');
var levels = document.getElementById('levels');



let puzzleText = "[[Land am [___s: Gänseflieger]] erklärt [[Die Bootgang, Hellapagos oder Hanabi][Zutat für [\"___ die mag ich sehr, sie schmecken mir am besten\"] die durch auspressen mit Handtuch und trocknen lassen gewonnen wird]]n [[D-___; Grenzgebiet; Zuckerberg] mit Zucker (🍎)]k, dass [___o: ist doch kein Ver[übergeben; trennen; fraktionieren] (De[längster Fluss in 🇮🇳]tri[form___: präzise beschrieben])][Acryl___: Entsteht beim zu heißen f[Mönchhausen auf Kanonenkugel]ieren von [Erdäpfel (Plural)]]en nicht von [[Prophet im Islam] 🥊]ens gebaut wurden.";
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

	// check if guess is solution to open question
	if (frageAntwortArr) {
		const matches = frageAntwortArr.filter(([frage, antwort]) => antwort.toLowerCase() === guess.toLowerCase());
		matches.forEach(found => {
			// checken ob frage bereits lösbar ist
			if (offeneFragen.some(f => f.toLowerCase() === found[0].toLowerCase())) {
				gelösteKlammern.unshift(found);
			}
		});
	}

	// replace question with solution
	gelösteKlammern.forEach(([frage, antwort]) => {
		const regex = new RegExp(`\\[${frage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'i');
		puzzleText = puzzleText.replace(regex, antwort);
	});
	displayPuzzleText();

	// replace question with answer

	inputFeld.value = '';

	guesses.innerHTML = solvedBracketsToSTring();
	inputFeld.focus();
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


displayPuzzleText();
// load file
loadJSON('raetsel/raetsel15.json');
inputFeld.focus();
