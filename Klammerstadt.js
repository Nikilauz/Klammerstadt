const inputFeld = document.getElementById('inputBox');
const guesses = document.getElementById('guesses');
const puzzleTextField = document.getElementById('puzzleText');
var levels = document.getElementById('levels');


let guessesString = "";
let puzzleText = "[[Land am [___s: Gänseflieger]] erklärt [[Die Bootgang, Hellapagos oder Hanabi][Zutat für [\"___ die mag ich sehr, sie schmecken mir am besten\"] die durch auspressen mit Handtuch und trocknen lassen gewonnen wird]]n [[D-___; Grenzgebiet; Zuckerberg] mit Zucker (🍎)]k, dass [___o: ist doch kein Ver[übergeben; trennen; fraktionieren] (De[längster Fluss in 🇮🇳]tri[form___: präzise beschrieben])][Acryl___: Entsteht beim zu heißen f[Mönchhausen auf Kanonenkugel]ieren von [Erdäpfel (Plural)]]en nicht von [[Prophet im Islam] 🥊]ens gebaut wurden.";
let JSONdata = null;


function parseNewGuess() {
	guessesString = inputFeld.value + "<br />" + guessesString;
	guesses.innerHTML = guessesString;
	inputFeld.value = '';
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

displayPuzzleText();


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

// loadJSON('raetsel1.json');