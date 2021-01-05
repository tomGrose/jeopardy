// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const gameWidth = 6;
const gameHeight = 6;

// $("body").prepend($("<div id='gameContainer'><div id='gameBoard'></div></div>"))
// const $button = $("<button id='startButton'>Restart Game</button>");
// $("#gameContainer").append($button);

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const result = await axios.get("https://jservice.io/api/categories", {params: {count:80}});
    let ids = _.sampleSize(result.data.map((val) => val.id), gameWidth);
    return ids;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const result = await axios.get("https://jservice.io/api/category", {params: {id:catId}});
    return result.data;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 */

async function fillTable(width, height) {
    // create rows and table datas for the table. This should be set up for slight tweaking if you wanted to add more categories to the game board

    //create table and append to the DOM
    const $gameDiv = $("<table id='gameTable'><thead></thead><tbody></tbody></table>");
    $('#gameBoard').prepend($gameDiv);

    // array to store rows
    let rows = [];

    // Create and add rows to the rows array that will be in the table body, 1 less than height because the first row is in the table header
    for (let i = 0; i < height - 1; i++){
        let $tr = $(`<tr id=${i}></tr>`);
        rows.push($tr);
    }
    // append row to table head
    $('thead').append(`<tr></tr>`);

    // Append the rows to the table body from the rows array
    for (let i = 0; i < rows.length; i++){
        $("tbody").append(rows[i]);
    }
    // Add table heads to the table head row with the category name inside
    for (let i = 0; i < width; i++) {
        const $header = $(`<th><h3 class='categories'>${categories[i].title}<h3></th>`);
        $("thead").children().append($header);
    }
    // Add the table data cells to the table body with data that links the category index in 
    //the global categories array and the clue index within that category
    for (let i = 0; i < width; i++) {
        for (let x = 0; x < width; x++){
            const $rowCell = `<td data-category="${x}" data-clue="${i}">?</td>`
            $(`#${i}`).append($rowCell);
        }
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

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
    // get ids to pull categories
    const ids = await getCategoryIds();
    //populate global categories array by looping through each category and adding their clues to an array.
    //then take the title from the cat and the clues array to send to catgeories as an object
    for (id of ids) {
        let cat = await getCategory(id);
        let clues = [];
        for (clue of cat.clues) {
            clues.push({question: clue.question, answer: clue.answer, showing: null});
        }
        categories.push({title: cat.title, clues: clues});
    }
    // create the html table
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

    // add game container on load as well as restart button
    $("body").prepend($("<div id='gameContainer'><div id='gameBoard'></div></div>"))
    const $button = $("<button id='startButton'>Restart Game</button>");
    $("#gameContainer").append($button);

    // Run setupAndStart to set up the game
    setupAndStart();

    //Create event listener for the tds on the page
    $("#gameBoard").on("click", "td", function(e){
        handleClick(e);
    });
})

