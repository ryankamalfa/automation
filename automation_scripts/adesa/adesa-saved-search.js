require("dotenv").config();
const retry = require('async-retry');
const browser = require('./browser');
const {encodeStringForURI, asyncForEach, isFileExists} = require('./utils/helper');
// const searches = require('./model/adesa-search-terms.json');

const cloud = require('./model/cloud');
const arango = require('./model/arango');

(async function main() {
    try {
        let credentials = await cloud.get_credentials();
        await browser.startBrowser({
            username: credentials.luminati.username,
            password: credentials.luminati.password
        })
        await browser.registerListeners()

        
        /*
            Adesa is facing an issue on 1st try to load login page 
            so we are getting request_timeout on puppeteer which breaks the script
            this code should retry to load the page for up to 3 times
        */
        await retry(async (bail) => {
            const login = await browser.loginToAdesa(credentials.adesa.username, credentials.adesa.password);
            console.log('--------------------',login);
        },
        {
            retries: 5,
            onRetry(e){
                console.log('can not load adesa login, lets retry',e);
            }
        });



        let url_base = await browser.getSavedSearchURLAdesa()

        let resultsPerPage = 25
        let currentPage = 1
        let maxPages = 0
        let skip = 0

        do {
            let final_url = null
            skip = (currentPage - 1) * resultsPerPage
            console.log(`Search Page: ${currentPage}`)
            final_url = url_base + `&from=${skip}`
            console.log(`Search URL: ${final_url}`)
            let searchInfo = await browser.searchAdesa(final_url, maxPages)
            if (!searchInfo) {
                console.log(`Search page didn't load`)
                break
            }
            if (maxPages === 0) {
                maxPages = searchInfo.maxPages
                resultsPerPage = searchInfo.result_per_page
            }

            console.log(`Processed: ${currentPage}/${maxPages}`)
            currentPage += 1
        } while (currentPage <= maxPages)
        await browser.closeBrowser()

        console.log(`success`)
    } catch (e) {
        console.log(`Final exit as we have got error`)
        console.log(e)
        process.exit(1);
    } finally {
        process.exit(0);
    }
})()
