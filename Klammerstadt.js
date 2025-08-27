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


// detect puzzle from url


// (de-)compression: https://evanhahn.com/javascript-compression-streams-api-with-strings/

async function pumpDataThrough(stream, data) {
	const frameStream = new Blob([data]).stream().pipeThrough(stream)
	const chunks = new Uint8Array([])
	for await (const byteChunk of frameStream) {
		chunks.push(byteChunk)
	}
	return chunks.flat()
}

async function compress(text) {
	return await pumpDataThrough(new CompressionStream("gzip"), await new Textencoder().encode(text)).toBase64()
}

async function decompress(base64String) {
	return new TextDecoder().decode(
		await pumpDataThrough(new DecompressionStream("gzip"), Uint8Array.fromBase64(base64String))
	)
}

// legacy de-/encoding

// Encodes a unicode string to url-safe base64, i.e. can be used as a url-parameter.
// To ensure URL-safety, we replace some base64 characters. To correctly decode, use the function below.
function encodeToURLSafeBase64(str) {
	const UTF8Array = (new TextEncoder()).encode(str); // Convert general Unicode to an UTF-8-Array
	const Base64string = btoa(String.fromCharCode(...UTF8Array)) // Convert that UTF-8-Array into Base64

	// Base64 contains A–Z a–z 0–9 + / and = for padding.
	const UrlSafeEncoding = Base64string.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
	return UrlSafeEncoding
}

// Decodes a string created with the above encoding function to a unicode string.
function decodeURLSafeBase64(str) {
	let Base64string = str.replace(/-/g, "+").replace(/_/g, "/"); // We replace the URL-safe variants with their correct Base64 counterparts

	// And add the stripped "=" symbols until the string is again valid Base64 (has a multiple of 4 length)
	while (Base64string % 4) {
		Base64string += "=";
	}

	const UTF8Array = Uint8Array.from(atob(Base64string), c => c.charCodeAt(0)); // Convert Base64-string back to an UTF-8-Array
	return (new TextDecoder()).decode(UTF8Array); // and parse this as a string and return it.
}

// url extraction

const urlParameters = new URLSearchParams(window.location.search);
const puzzleValue = urlParameters.get('') // Assume the encoded string is behind the unnamed parameter, i.e. https://foo.bar/?=<value>
// Otherwise, we could use a named parameter, i.e. https://foo.bar/?puzzle=<value>

// If the parameter is set, use it, otherwise load a default puzzle.
if (puzzleValue) {
	try {
		let puzzleString = ""
		try {
			puzzleString = await decompress(decodeURIComponent(puzzleValue))
		} catch (err) {
			console.log("puzzle extraction failed, trying legacy decoding...")
			puzzleString = decodeURLSafeBase64(puzzleValue);
		}

		console.log(puzzleString)
		data = JSON.parse(puzzleString);

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


// create new puzzles

const toggleButton = document.querySelector("#toggleView button")
toggleButton.onclick = () => document.querySelectorAll("body>div:not(#toggleView)")
	.forEach(e => e.classList.toggle("no-display"))

const createArea = document.querySelector("#creator textarea")
const shareLink = document.querySelector("#creator a")
createArea.onchange = () => shareLink.setAttribute("href",
	".?=" + encodeURIComponent(compress(createArea.value)))
