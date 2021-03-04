
let categories = [];
const gameWidth = 6;
const gameHeight = 6;


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const result = await axios.get("https://jservice.io/api/categories", {params: {count:80}});
    let ids = _.sampleSize(result.data.map((val) => val.id), gameWidth);
    return ids;
}


// Return object with data about a category
async function getCategory(catId) {
    const result = await axios.get("https://jservice.io/api/category", {params: {id:catId}});
    return result.data;
}

// Populate the game table with data
async function fillTable(width, height) {

    let rows = "";
    let tableHeaders = "";

    const cells = createCells(width, height);

    for (let i = 0; i < height - 1; i++){
        const tr = `<tr id=${i}>${cells[i]}</tr>`;
        rows += tr;
    }

    for (let i = 0; i < width; i++) {
        const tableHeader = `<th><h3 class='categories'>${categories[i].title}<h3></th>`;
        tableHeaders += tableHeader;
    }
  
    const $gameDiv = $(`<table id='gameTable'><thead><tr>${tableHeaders}</tr></thead><tbody>${rows}</tbody></table>`);
    $('#gameBoard').prepend($gameDiv);
}


function createCells(width, height){
    
    let cells = [];

    for (let i = 0; i < height - 1; i++){
        cells.push("");
    }

    for (let i = 0; i < height - 1; i++) {
        for (let x = 0; x < width; x++){
            const rowCell = `<td data-category="${x}" data-clue="${i}">?</td>`;
            cells[i] += rowCell;
        }
    }

    return cells;
}


 // Handle clicking on a clue: show the question or answer.
function handleClick(evt) {
    const cell = evt.target;

    //get data for the specific category index within categories, and the clue index within that category
    const categoryIndx = cell.dataset.category;
    const clueIndx = cell.dataset.clue;
    const question = categories[categoryIndx].clues[clueIndx].question;
    const answer = categories[categoryIndx].clues[clueIndx].answer;

    //check to see what is showing, whether it is the clue or answer. Update the Dom to reflect this. If answer is showing ignore click
    if (!categories[categoryIndx].clues[clueIndx].showing) {
        cell.innerText = question;
        categories[categoryIndx].clues[clueIndx].showing = "question";
    } else if (categories[categoryIndx].clues[clueIndx].showing === "question") {
        cell.innerText = answer;
        categories[categoryIndx].clues[clueIndx].showing = "answer";
    } else {
        return;
    }
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const ids = await getCategoryIds();
    //populate global categories array by looping through each category and adding their clues to an array.
    //then take the title from the cat and the clues array to send to catgeories as an object
    for (id of ids) {
        let cat = await getCategory(id);
        const clues = cat.clues.map(function(val){
            return {question: val.question, answer: val.answer, showing: null}
        });
        categories.push({title: cat.title, clues: clues});
    }

    fillTable(gameWidth, gameHeight);

}

/** On click of start / restart button, set up game. */
$("body").on("click", "button", function(e){
    categories = [];
    $("#gameBoard").empty()
    setupAndStart();
});

/** On page load, add event handler for clicking clues */
$(window).on("load", function(e) {

    const $button = $("<button id='startButton'>Restart Game</button>");
    $("#gameContainer").append($button);

    setupAndStart();

    $("#gameBoard").on("click", "td", function(e){
        handleClick(e);
    });
})

