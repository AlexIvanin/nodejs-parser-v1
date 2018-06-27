const ProgressBar = require('progress');

function createProgressBar(string, total) {

    return new ProgressBar(
        `${string.padEnd(25)} [:bar] (:current/:total, :percent) Time: :elapseds/:etas`,
        {
            total: total,
            complete: '=',
            incomplete: ' ',
            width: 40,
        }
    );
}

module.exports = {
    createProgressBar
};