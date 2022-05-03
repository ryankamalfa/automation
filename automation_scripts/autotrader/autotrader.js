require("dotenv").config();
let Browser = require('./controllers/browser');
let AutoTrader = require('./controllers/autotrader/autotrader');
// const searches = require('./model/autotrader-search-terms.json');
const Listings = require('./model/listings')
const cloud = require('./model/cloud');
const arango = require('./model/arango');
const async = require('async');

const {encodeStringForURI, asyncForEach} = require('./utils/helper');
(async () => {


    /*
        ***** DONE *****
        Replace searches 
        Instead of getting data from JSON file "./model/autotrader-search-terms.json"
        We should get data from ArangoDB collection "listings"
    */
    let searches = await cloud.get_listings();
    // console.log(searches);
    /*
        New function to loop over each search and extract trims
    */
    // await asyncForEach(searchs)
    let credentials = await cloud.get_credentials();
    let start = new Date();
    let proxy = {
        username: credentials.luminati.username,
        password: credentials.luminati.password
    };
    let browser = new Browser(proxy);
    browser = await browser.init();
    let autoTrader = new AutoTrader(browser);


    async.eachSeries(searches, function(search,callback){
        //get each search trims and loop
        (async()=>{
            console.log('search',search);
            var {make, model,start_year,end_year} = search;
            let url_base = `https://www.autotrader.ca/cars/`;
            let make_model_path = `${await encodeStringForURI(make.toLowerCase())}/${await encodeStringForURI(model.toLowerCase())}/`;
            let query_common = `?srt=9&yRng=${start_year}%2C${end_year}&prx=-1&loc=A1A%201A1&hprc=True&wcp=True&sts=Used-Damaged&adtype=Dealer&inMarket=advancedSearch`;
            let url = url_base + make_model_path + query_common;
            console.log('-------------------',url_base);
            let trims = await autoTrader.getTrims(url);
            console.log('trims',trims);
            if(trims && trims.length){
                async.eachSeries(trims,function(trim,callback){
                    /*
                        assign trim to search and fire asyncForEach function to get listings
                        search.trim = trim;
                    */
                    (async()=>{
                        search.trim = trim;
                        await searchListings(search);
                        callback();
                    })();
                },function(){
                    //done for each search
                    callback();
                });
            }else{
                callback();
            }
        })();
        
    },async function(){
        /*
            should close browser and exit script
        */
        await autoTrader.browser.closeBrowser()
        let end = new Date() - start;
        console.info('Execution time: %ds', end / 1000)
        console.log(`All done`);
        process.exit(0);
    });



    function searchListings(search){
        return new Promise(async (resolve)=>{
            var {make, model, trim,start_year,end_year} = search
            console.log(make, model, trim)
            let allNewItemsCollected = false

            let rcp = 15
            let currentPage = 1
            let maxPage = 50
            let rcs = 0
            let url_base = `https://www.autotrader.ca/cars/`;
            let make_model_path = `${await encodeStringForURI(make.toLowerCase())}/${await encodeStringForURI(model.toLowerCase())}/`;
            let query_common = `?rcp=${rcp}&srt=9&yRng=${start_year}%2C${end_year}&prx=-1&loc=A1A%201A1&hprc=True&wcp=True&sts=Used-Damaged&adtype=Dealer&inMarket=advancedSearch`;
            //we should visit page and extract valid trims
            /*
                $('#faceted-parent-Trim ul input')
            */
            
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
                    console.log(`Search page didn't load`);
                    resolve(true);
                    break;
                }

                let searchResult = await autoTrader.getSearchResult()
                if (!searchResult){
                    resolve(true);
                    break;
                }
                let results = await autoTrader.getListingURLsAndIds(searchResult)

                if (!results || results.length < 1){
                    resolve(true);
                    break;
                }
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



                    if(!lastItemData[0]){

                        /*
                            For listing in @value
                            upsert {listing_id:listing.listing_id}
                            insert listing
                            update listing in crawled_listings
                        */
                        await arango.query({
                            query: `
                            For listing in @value
                            insert listing in crawled_listings`,
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
                    }




                    let listings = await arango.query(`
                            For x in crawled_listings
                            filter !x.script_id
                            Sort x.created_at asc
                            return x
                            `);
                        let listingsData = await listings.all();



                        let count = await arango.query(`
                            FOR x IN crawled_listings
                            filter x.script_id
                            COLLECT WITH COUNT INTO length
                            RETURN {"count":length}
                            `);
                        let countData = await count.all();

                        let start_id = 100000+countData[0].count;

                        console.log(listingsData.length);

                        async.eachSeries(listingsData,function(listing,callback){
                            (async()=>{
                                await arango.query({
                                    query:`for listing in crawled_listings
                                            filter listing._id == @_id
                                            update listing with {script_id:@script_id} in crawled_listings`,
                                    bindVars:{
                                        _id:listing._id,
                                        script_id:start_id
                                    }
                                }).then(function(cursor) {
                                  return cursor.next().then(function(result) {
                                    // ...
                                    console.log('successfully updatign cript_id',start_id);
                                    start_id++;
                                    callback();
                                  });
                                })
                                .catch(function(err) {
                                  // ...
                                  console.log('error updating script_id into arangodb',err);
                                  callback();
                                });
                                // console.log('update_listing ---- ',start_id);
                                
                                // callback();
                            })()
                        },function(){
                            console.log('Updated all listings IDS');
                        });
                    
                    
                    


                    /*
                        ***** DONE *****
                        Replace with ArangoDB
                        (Should insert all results into database)
                    */
                    
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
                resolve(true);

                if (allNewItemsCollected) {
                    resolve(true);
                    break;
                }

            } while (currentPage <= maxPage && currentPage <= 100)
        });
    }     

})()
