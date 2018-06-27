const ENV = require('dotenv').load().parsed;
const log = require('cllc')();
const argv = require('yargs').argv;
const steps = argv['parse'] ? argv['parse'].split(',') : ['list, products'];

const config = {
    db: `mongodb://${ENV.DB_URL}`
};

const mongoose = require('./config/database')(config);

const app = require('./controllers/log.controller.js');
const product = require('./controllers/product.controller');
const parseListPage = require('./libs/parsePageListProducts.js');
const parseProductPage = require('./libs/parseProductPage.js');
const parseProductFull = require('./libs/parseProductFull.js');
const parseToCSV = require('./libs/parseToCsv.js')
global.cookieKrollcorp = {};

async function run() {

    try{
        await app.start(ENV.URL);
        log.i('Parsing data started');
        if(steps.includes('Parsing')) {
         await parseListPage.run('https://www.sil.lt/shoes2.html');
         await parseListPage.run('https://www.sil.lt/clothes.html');
         await parseListPage.run('https://www.sil.lt/accessories.html');
        }
        if(steps.includes('FullParser')) {
          await parseProductPage.run();
        }
        if(steps.includes('Csv')) {
           await parseToCSV.run();
        }
        if (steps.includes('Errors')){
            await parseProductFull.run();

        }
        
       
    }
    catch (err) {
        throw new Error(err);
    }
}

run()
    .then(() => {
        app.finishSuccessfully().then(() => {
            log.i('Completed');
            mongoose.disconnect();
        });
    })
    .catch((err) => {
        app.finishWithError().then(() => {
            log.w('Completed with errors');
            log.e('Errors: ', err);
            mongoose.disconnect();
        });
    });