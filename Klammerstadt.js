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

function checkForFullSolution() {
	if (puzzleText === JSONdata.gesamtlösung) {
		puzzleText = [puzzleText, "Juhuu, Rätsel gelöst! Das hat gar nicht lang gedauert..."].join("<br /><br />");
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
	if (innerIndices.length === 0) {
		displayText = puzzleText;
	} else {
		innerIndices.forEach(([start, end]) => {
			displayText += puzzleText.substring(lastEnd, start);
			displayText += "<mark>" + puzzleText.substring(start, end + 1) + "</mark>";
			lastEnd = end + 1;
		});
		displayText += puzzleText.substring(lastEnd);
	}
	puzzleTextField.innerHTML = displayText;
}


function loadJSON(file) {
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

function getInnerBracketIndices(string) {
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

// Encodes a unicode string to url-safe base64, i.e. can be used as a url-parameter.
// To ensure URL-safety, we replace some base64 characters. To correctly decode, use the function below.
function encodeToURLSafeBase64(str) {
	const UTF8Array = (new TextEncoder()).encode(str); // Convert general Unicode to an UTF-8-Array
	const Base64string = btoa(String.fromCharCode(...UTF8Array)) // Convert that UTF-8-Array into Base64

	// Base64 contains A–Z a–z 0–9 + / and = for padding.
	// use built-in function for this: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
	const UrlSafeEncoding = encodeURIComponent(Base64string)
	return UrlSafeEncoding
}

// Decodes a string created with the above encoding function to a unicode string.
function decodeURLSafeBase64(str) {
	let Base64string = decodeURIComponent(str); // We replace the URL-safe variants with their correct Base64 counterparts

	// And add the stripped "=" symbols until the string is again valid Base64 (has a multiple of 4 length)
	while (Base64string % 4) {
		Base64string += "=";
	}

	const UTF8Array = Uint8Array.from(atob(Base64string), c => c.charCodeAt(0)); // Convert Base64-string back to an UTF-8-Array
	return (new TextDecoder()).decode(UTF8Array); // and parse this as a string and return it.
}

const urlParameters = new URLSearchParams(window.location.search);
const puzzleValue = urlParameters.get('') // Assume the encoded string is behind the unnamed parameter, i.e. https://foo.bar/?=<value>
// Otherwise, we could use a named parameter, i.e. https://foo.bar/?puzzle=<value>

// If the parameter is set, use it, otherwise load a default puzzle.
if (puzzleValue) {
	try {

		//puzzleString = decodeURIComponent(atob(puzzleValue))
		puzzleString = decodeURLSafeBase64(puzzleValue);
		console.log(puzzleString)
		data = JSON.parse(puzzleString);

		//binaryData = Uint8Array.from(atob(puzzleValue), c => c.charCodeAt(0));
		//data = (new TextDecoder).decode(binaryData);

		// Decode Base64 string and then parse the value into a JSON-object
		//data = JSON.parse(a);

		console.log(data);

		JSONdata = data;
		puzzleText = data.rätsel;
		gesamtlösung = data.gesamtlösung;
		frageAntwortArr = data.frageAntwort.map(obj => [obj.frage, obj.antwort]);
		displayPuzzleText();


	} catch (err) {
		console.log("Error loading puzzle from URL parameter");
		console.log(err)
		loadJSON('raetsel/aktuelles.json');
	}
} else {
	loadJSON('raetsel/aktuelles.json');
}

inputFeld.focus();

// How to share custom puzzles:
// Transform your puzzle into a JSON-object in the style of any other puzzle you can find in the raetsel/ folder.
// encode this JSON-object into a special Base64-encoding via first stringifying it (escaping some characters):
// JSON.stringify(object)
// and then encoding it:
// encodeToURLSafeBase64(str)
//
// You can then play your puzzle by putting this (loooong) string behind the url as a parameter:
// https://klammerstadt.de/?=<value>
// Where <value> is your loooong string you got from the encoding.


const createString = "Neues Rätsel erstellen"
const guessString = "Weiter raten..."

const toggleButton = document.querySelector("#toggleView button")
toggleButton.onclick = () => document.querySelectorAll("body>div:not(#toggleView)")
	.forEach(e => e.classList.toggle("no-display"))
toggleButton.innerText = createString

