"use strict";
/*1. Load word and hint*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//create an object to store the current game information
const game = {
    selectedWord: "",
    selectedHint: "",
    guessedLetters: [],
    livesRemaining: 6,
    gameOver: false
};
//store the animation and timeout handlers
let shakeAnimation = null;
let shakeTimeout = null;
//fetch the JSON file and randomly select a word
function loadWord() {
    return __awaiter(this, void 0, void 0, function* () {
        //select HTML elements to update
        const hintElement = document.getElementById("hint-text");
        const wordDisplayElement = document.getElementById("word-display");
        //ensure both HTML elements exist
        if (!hintElement || !wordDisplayElement) {
            console.error("Required HTML elements were not found.");
            return;
        }
        try {
            //request the JSON file using a relative path
            const response = yield fetch("data/words.json");
            //check whether the HTTP request was successful
            if (!response.ok) {
                throw new Error("Unable to load words.json");
            }
            //convert JSON data into an array of WordHint objects
            const wordList = yield response.json();
            //make sure the word collection is not empty
            if (wordList.length === 0) {
                throw new Error("The word list is empty.");
            }
            //generate a random index from the word array
            const randomIndex = Math.floor(Math.random() * wordList.length);
            //select the word-and-hint object at that index
            const selectedItem = wordList[randomIndex];
            //store the selected word and hint in the game object
            game.selectedWord = selectedItem.word.toUpperCase();
            game.selectedHint = selectedItem.hint;
            //display the hint in the HTML
            hintElement.textContent = game.selectedHint;
            //reset the guessed letters for a new word
            game.guessedLetters = [];
            //display the mystery word with underscores.
            displayWord();
        }
        catch (error) {
            //display an error if loading fails
            console.error("Error loading game data:", error);
            hintElement.textContent = "Unable to load word list.";
            wordDisplayElement.textContent = "";
        }
    });
}
/*2. Display correctly guessed letters*/
//update the mystery word with correctly guessed letters
function displayWord() {
    //select the HTML element displaying the mystery word
    const wordDisplay = document.getElementById("word-display");
    //stop if the HTML element cannot be found
    if (!wordDisplay) {
        return;
    }
    //check each letter in the selected word
    const displayedWord = game.selectedWord
        .split("")
        .map(letter => {
        //reveal letters previously guessed
        if (game.guessedLetters.includes(letter)) {
            return letter;
            //otherwise, display an underscore.
        }
        else {
            return "_";
        }
    })
        .join(" ");
    //update the HTML mystery word.
    wordDisplay.textContent = displayedWord;
}
/*3. Process letter selection*/
//process a letter selected by the player
function selectLetter(letter) {
    //stop if the word has not loaded or no lives remain
    if (game.selectedWord === "" || game.gameOver) {
        return;
    }
    //prevent a letter from being selected more than once
    if (game.guessedLetters.includes(letter)) {
        return;
    }
    //add the selected letter to the guessed letters array
    game.guessedLetters.push(letter);
    //find the corresponding on-screen keyboard button
    const selectedButton = document.querySelector(`#keyboard button[data-letter="${letter}"]`);
    //disable the selected letter button
    if (selectedButton) {
        selectedButton.disabled = true;
    }
    //check if the selected letter is incorrect
    if (!game.selectedWord.includes(letter)) {
        //decrease the number of remaining lives
        game.livesRemaining--;
        //select the lives remaining HTML element
        const livesElement = document.getElementById("lives-count");
        //update the displayed lives remaining
        if (livesElement) {
            livesElement.textContent = game.livesRemaining.toString();
        }
        //calculate the total number of incorrect guesses
        const incorrectGuesses = 6 - game.livesRemaining;
        //select the dog image
        const dogImage = document.getElementById("dog-image");
        //update the image to show additional bone cracks
        if (dogImage) {
            dogImage.src = `images/bone-${incorrectGuesses}.png`;
            dogImage.alt = `Dog with ${incorrectGuesses} incorrect guesses`;
        }
        //shake the dog after an incorrect guess
        shakeDog();
    }
    //update the mystery word with correctly guessed letters
    displayWord();
    //check whether the player has won or lost
    checkGameResult();
}
/*4. Check game result*/
//check whether the player has won or lost
function checkGameResult() {
    //check if every letter in the word has been guessed
    const allLettersGuessed = game.selectedWord
        .split("")
        .every(letter => game.guessedLetters.includes(letter));
    //player wins if all letters have been guessed
    if (allLettersGuessed) {
        endGame(true);
        //player loses if no lives remain
    }
    else if (game.livesRemaining === 0) {
        endGame(false);
    }
}
/*4. End game*/
//end the game and display the result
function endGame(won) {
    //mark the game as finished
    game.gameOver = true;
    //select the HTML elements
    const livesElement = document.getElementById("lives-remaining");
    const gameResult = document.getElementById("game-result");
    const resultMessage = document.getElementById("result-message");
    const dogImage = document.getElementById("dog-image");
    const wordDisplay = document.getElementById("word-display");
    //hide the lives remaining indicator
    if (livesElement) {
        livesElement.hidden = true;
    }
    //display the game result and Play Again button
    if (gameResult) {
        gameResult.hidden = false;
    }
    //display different results for winning and losing
    if (won) {
        //display the winning message
        if (resultMessage) {
            resultMessage.textContent = "You Win! The bone is saved!";
        }
        //change to the happy dog image
        if (dogImage) {
            dogImage.src = "images/dog-happy.png";
            dogImage.alt = "Happy golden doodle celebrating a win";
        }
    }
    else {
        //display the losing message
        if (resultMessage) {
            resultMessage.textContent = "You Lose! The bone broke!";
        }
        //show the broken bone image
        if (dogImage) {
            dogImage.src = "images/bone-6.png";
            dogImage.alt = "Golden doodle with broken bone on the ground";
        }
        //reveal the correct word
        if (wordDisplay) {
            wordDisplay.textContent = game.selectedWord.split("").join(" ");
        }
    }
    //disable all keyboard buttons when the game ends
    keyboardButtons.forEach(button => {
        button.disabled = true;
    });
}
/*5. Start a new game*/
//reset all game information and start again
function startNewGame() {
    //stop any unfinished dog animation
    if (shakeAnimation !== null) {
        cancelAnimationFrame(shakeAnimation);
        shakeAnimation = null;
    }
    //stop any unfinished animation timeout
    if (shakeTimeout !== null) {
        clearTimeout(shakeTimeout);
        shakeTimeout = null;
    }
    //reset the game object properties
    game.selectedWord = "";
    game.selectedHint = "";
    game.guessedLetters = [];
    game.livesRemaining = 6;
    game.gameOver = false;
    //select the HTML elements
    const livesElement = document.getElementById("lives-remaining");
    const livesCount = document.getElementById("lives-count");
    const gameResult = document.getElementById("game-result");
    const dogImage = document.getElementById("dog-image");
    const hintElement = document.getElementById("hint-text");
    const wordDisplay = document.getElementById("word-display");
    //show the lives remaining indicator
    if (livesElement) {
        livesElement.hidden = false;
    }
    //reset the lives count to six
    if (livesCount) {
        livesCount.textContent = "6";
    }
    //hide the game result and Play Again button
    if (gameResult) {
        gameResult.hidden = true;
    }
    //reset the dog image to the unbroken bone
    if (dogImage) {
        dogImage.src = "images/bone-0.png";
        dogImage.alt = "Golden doodle holding unbroken bone";
        dogImage.style.transform = "";
    }
    //display a loading message while selecting a word
    if (hintElement) {
        hintElement.textContent = "Loading hint...";
    }
    //clear the previous mystery word
    if (wordDisplay) {
        wordDisplay.textContent = "";
    }
    //enable all keyboard buttons for the new game
    keyboardButtons.forEach(button => {
        button.disabled = false;
    });
    //load a new random word and hint
    loadWord();
}
/* Dog shake animation*/
//shake the dog when an incorrect letter is selected
function shakeDog() {
    //select the dog image
    const dogImage = document.getElementById("dog-image");
    //stop if the image cannot be found
    if (!dogImage) {
        return;
    }
    //cancel any previous animation
    if (shakeAnimation !== null) {
        cancelAnimationFrame(shakeAnimation);
    }
    //cancel any previous timeout
    if (shakeTimeout !== null) {
        clearTimeout(shakeTimeout);
    }
    //define the dog's horizontal positions
    const positions = [0, -8, 8, -6, 6, 0];
    //track the current position in the array
    let positionIndex = 0;
    //move the dog to the next position
    function moveDog() {
        //update the dog's horizontal position
        dogImage.style.transform =
            `translateX(${positions[positionIndex]}px)`;
        //advance to the next position
        positionIndex++;
        //continue until all positions have been displayed
        if (positionIndex < positions.length) {
            //delay the next frame by 70 milliseconds
            shakeTimeout = window.setTimeout(() => {
                //request the next animation frame
                shakeAnimation = requestAnimationFrame(moveDog);
            }, 70);
        }
        else {
            //return the dog to its original position
            dogImage.style.transform = "";
            //reset the animation handlers
            shakeAnimation = null;
            shakeTimeout = null;
        }
    }
    //start the animation
    shakeAnimation = requestAnimationFrame(moveDog);
}
/*6. Mouse input*/
//select all letter buttons within the on-screen keyboard
const keyboardButtons = document.querySelectorAll("#keyboard button");
//loop through each letter button
keyboardButtons.forEach(button => {
    //add a click event listener to each button
    button.addEventListener("click", () => {
        //get the selected letter from the data-letter attribute
        const letter = button.dataset.letter;
        //process the letter if it exists
        if (letter) {
            selectLetter(letter);
        }
    });
});
/*7.Physical keyboard input*/
//listen for key presses on the physical keyboard
document.addEventListener("keydown", (event) => {
    //ignore shortcuts and repeated held-down keys
    if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) {
        return;
    }
    //convert the pressed key to uppercase
    const letter = event.key.toUpperCase();
    //only process single letters from A to Z
    if (/^[A-Z]$/.test(letter)) {
        //process the selected letter using the existing function
        selectLetter(letter);
    }
});
/*8. Play again button*/
//select the Play Again button
const playAgainButton = document.getElementById("play-again-button");
//add an event listener to restart the game
if (playAgainButton) {
    playAgainButton.addEventListener("click", () => {
        //reset the game and select a new word
        startNewGame();
    });
}
/*start game*/
//initialize the game when the page loads
startNewGame();
