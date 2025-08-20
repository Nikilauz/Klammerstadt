const inputFeld = document.getElementById('inputBox');
const guesses = document.getElementById('guesses');
var levels = document.getElementById('levels');

let guessesString = "";


inputFeld.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();

    readAndDisplay();
    inputFeld.focus();
  }
});


//create all the level buttons
const fs = require('fs');
const path = require('path')

const jsonsInDir = fs.readdirSync('./').filter(file => path.extname(file) === '.json');

jsonsInDir.forEach(file => {
  const fileData = fs.readFileSync(path.join('./', file));
  const obj = JSON.parse(fileData.toString());
	const butt = document.createElement("BUTTON");
	const tex = document.createTextNode(obj.name);
	butt.appendChild(tex);
	levels.appendChild(butt);
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
