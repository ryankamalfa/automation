require("dotenv").config();
const browser = require('./browser')
const {encodeStringForURI, asyncForEach, isFileExists} = require('./utils/helper');
// const searches = require('./model/adesa-search-terms.json');
const cloud = require('./model/cloud');
const arango = require('./model/arango');


(async function main() {
    let credentials = await cloud.get_credentials();
    await browser.startBrowser()
    await browser.registerListeners()
    await browser.loginToAdesa(credentials.adesa.username, credentials.adesa.password)
    await browser.getSavedSearchURLAdesa()
    let searches = await cloud.get_listings();
    await asyncForEach(searches, async (search) => {
        const {make, model, trim} = search
        console.log(make, model, trim)
    
        let resultsPerPage = 25
        let currentPage = 1
        let maxPages = 0
        let skip = 0
        let url_base = `https://openauctionca.prod.nw.adesa.com/mfe/search`
        let query_common = `?page=results&zipcode=T0M%200T0&year=2015-2020`
        let make_model = `&make=${await encodeStringForURI(make.toLowerCase())}&model=${await encodeStringForURI(model.toLowerCase())}`
    
        do {
            let final_url = null
            let query_custom_array = []
            skip = (currentPage - 1) * resultsPerPage
    
            if (trim && trim.length) {
                query_custom_array.push(`trim=${await encodeStringForURI(model.toLowerCase() + ' - ' + trim.toLowerCase())}`)
            }
            query_custom_array.push(`from=${skip}`)
            console.log(`Search Page: ${currentPage}`)
            final_url = url_base + query_common + make_model + `&${query_custom_array.join('&')}`
            console.log(`Search URL: ${final_url}`)
            let resultMaxPages = await browser.searchAdesa(final_url, maxPages)
            if (!resultMaxPages) {
                console.log(`Search page didn't load`)
                break
            }
            if (maxPages === 0) {
                maxPages = resultMaxPages
            }
            console.log(make, model, trim)
            console.log(`Processed: ${currentPage}/${maxPages}`)
            currentPage += 1
        } while (currentPage <= maxPages)
    })
    console.log(`All search terms covered`)

    await browser.close();
})()
