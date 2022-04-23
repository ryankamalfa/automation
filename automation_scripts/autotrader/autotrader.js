require("dotenv").config();
let Browser = require('./controllers/browser');
let AutoTrader = require('./controllers/autotrader/autotrader');
// const searches = require('./model/autotrader-search-terms.json');
const Listings = require('./model/listings')
const cloud = require('./model/cloud');
const arango = require('./model/arango');

const {encodeStringForURI, asyncForEach} = require('./utils/helper');
(async () => {


    /*
        ***** DONE *****
        Replace searches 
        Instead of getting data from JSON file "./model/autotrader-search-terms.json"
        We should get data from ArangoDB collection "listings"
    */
    let searches = await cloud.get_listings();
    await asyncForEach(searches, async (search) => {
        let credentials = await cloud.get_credentials();
        let start = new Date()
        let proxy = {
            username: credentials.luminati.username,
            password: credentials.luminati.password
        };
        let browser = new Browser(proxy)
        browser = await browser.init()
        let autoTrader = new AutoTrader(browser)

        var {make, model, trim,start_year,end_year} = search
        console.log(make, model, trim)
        let allNewItemsCollected = false

        let rcp = 15
        let currentPage = 1
        let maxPage = 50
        let rcs = 0
        let url_base = `https://www.autotrader.ca/cars/`
        let make_model_path = `${await encodeStringForURI(make.toLowerCase())}/${await encodeStringForURI(model.toLowerCase())}/`
        let query_common = `?rcp=${rcp}&srt=9&yRng=${start_year}%2C${end_year}&prx=-1&loc=A1A%201A1&hprc=True&wcp=True&sts=Used-Damaged&adtype=Dealer&inMarket=advancedSearch`

        do {
            console.log(`Starting loop`)
            console.log(make, model, trim, currentPage)
            let final_url = null
            let query_custom_array = []
            rcs = (currentPage - 1) * rcp
            query_custom_array.push(`rcs=${rcs}`)
            if (trim && trim.length) {
                query_custom_array.push(`trim=${await encodeStringForURI(trim)}`)
            }
            console.log(`Search Page: ${currentPage}`)
            final_url = url_base + make_model_path + query_common + `&${query_custom_array.join('&')}`
            console.log(final_url)

            let search = await autoTrader.search(final_url)
            if (!search) {
                console.log(`Search page didn't load`)
                break
            }

            let searchResult = await autoTrader.getSearchResult()
            if (!searchResult) break
            let results = await autoTrader.getListingURLsAndIds(searchResult)

            if (!results || results.length < 1) break
            results = results.slice(0, 15)
            console.log(`Listing found: ${results.length}`)
            console.log(results)
            if (results.length) {
                results = results.map(function (e) {
                    Object.assign(e, {"search_trim": this.search_trim})
                    Object.assign(e, {"search_make": this.search_make})
                    Object.assign(e, {"search_model": this.search_model})
                    Object.assign(e, {"created_at": new Date()})
                    return e
                }, {search_trim: trim, search_make: make, search_model: model})
                console.log({search_trim: trim, search_make: make, search_model: model})

                console.log(`Result:`)
                console.log(results)



                /* 
                    ***** DONE *****
                    Replace with ArangoDB
                    (Should check last inserted listing_id)
                */
                let lastItem = await arango.query(`
                    For l in crawled_listings 
                    filter l.listing_id == '${results[results.length - 1].listing_id}'
                    return l
                    `);
                let lastItemData = await lastItem.all();
                // let lastItem = await Listings.findOne({where: {listing_id: results[results.length - 1].listing_id}});
                if (lastItemData[0]) {
                    allNewItemsCollected = true
                    console.log(`Old listing found, so we are not checking next page`)
                }


                /*
                    ***** DONE *****
                    Replace with ArangoDB
                    (Should insert all results into database)
                */
                arango.query({
                    query: `FOR listing IN @value INSERT listing in crawled_listings`,
                    bindVars: { value: results }
                  })
                    .then(function(cursor) {
                      return cursor.next().then(function(result) {
                        // ...
                        console.log('successfully inserted listings into arangodb');
                      });
                    })
                    .catch(function(err) {
                      // ...
                      console.log('error inserted into arangodb',err);
                    });
                // await Listings.bulkCreate(results,
                //     {
                //         ignoreDuplicates: true
                //     }
                // )
                // console.log(`All records saved`)

            } else {
                console.log(`No listing found in this page`)
            }

            maxPage = searchResult.maxPage
            console.log(`MaxPage: ${maxPage}`)

            currentPage += 1

            if (allNewItemsCollected) break
        } while (currentPage <= maxPage && currentPage <= 100)
        await autoTrader.browser.closeBrowser()
        let end = new Date() - start
        console.info('Execution time: %ds', end / 1000)
    })
    console.log(`All done`);
    process.exit(0);

})()
