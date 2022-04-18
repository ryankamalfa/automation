require("dotenv").config();
let Browser = require('./controllers/browser');
let AutoTrader = require('./controllers/autotrader/autotrader');
const searches = require('./model/autotrader-search-terms.json');
const Listings = require('./model/listings')
const {Op} = require("sequelize");
const cloud = require('./model/cloud');
const arango = require('./model/arango');

const {encodeStringForURI, asyncForEach} = require('./utils/helper');

async function getDetails(listing, index, listings, obj) {
    console.log(`Listing ID: ${listing.listing_id}`)
    console.log(`Listing URL: ${listing.listing_url}`)
    console.log(`Processing url: ${index + 1}/${listings.length}`)
    let browser = null
    try {
        let listing_url = listing.listing_url
        browser = new Browser(obj.proxy)
        await browser.init()
        let page = await browser.getPage()

        await page.goto(listing_url, {waitUntil: ['networkidle2', 'load', 'domcontentloaded'], timeout: 120000})
        let status = await page.waitForFunction(() => typeof window['ngVdpModel'] === 'object').then(() => true).catch()
        if (!status) throw Error("Details not found")

        let result = await page.evaluate(() => {
            return window['ngVdpModel']
        });


    console.log('result ------>',result);


        let data = result
        let final_data = {
            'platform': 'autotrader',
            'listing_url': listing_url,
            'listing_id': result.adBasicInfo.adIdUnique,
            'details_collection_status': true,
            'details_collection_status_message': 'success'
        }
        let space = data.specifications.specs.reduce((obj, item) => Object.assign(obj, {[item.key.replace(' ', '_').toLowerCase()]: item.value}), {})
        if (data.featureHighlights && data.featureHighlights.options) {
            Object.assign(final_data, {options: data.featureHighlights.options.join('|')})
        }
        if (data.featureHighlights && data.featureHighlights.highlights) {
            Object.assign(final_data, {highlights: data.featureHighlights.highlights.join('|')})
        }

        if (data.carInsurance && data.carInsurance.vin) {
            Object.assign(final_data, {vin: data.carInsurance.vin})
        } else if (data.carfax && data.carfax.buyCarProofUrl && data.carfax.buyCarProofUrl.indexOf('vin=') !== -1) {
            Object.assign(final_data, {vin: data.carfax.buyCarProofUrl.match(/vin\=\w+/)[0].replace('vin=', '')})
        }
        if (data.dealerTrust && data.dealerTrust.cityProvinceName && data.dealerTrust.cityProvinceName.indexOf(', ') > 0) {
            Object.assign(final_data, {province: data.dealerTrust.cityProvinceName.split(', ')[1]})
        }
        Object.assign(final_data, data.hero)
        Object.assign(final_data, space)

        if (final_data.mileage && final_data.mileage.length) {
            final_data.kilometres = final_data.mileage.replace(/[^\d\.]/g, '')
            final_data.miles = Math.round(final_data.kilometres * 0.621371)
            final_data.kilometres = Math.round(final_data.kilometres)
        }
        // 
        let allowed = Object.keys(Listings.rawAttributes)
        let given = Object.keys(final_data)

        let exclude = given.filter(e => !allowed.includes(e))

        exclude.forEach(v => delete final_data[v]);
        final_data['listing_id'] = listing.listing_id
        // console.log(`Trying to store`)
        // console.log(final_data)

        if (final_data.price && final_data.price.length) {
            final_data.price = final_data.price.replace(/[^\d\.]/g, '')
        }
        /*
            ***** DONE *****
            Replace into ArangoDB
            (Update old listing data)
        */
        await arango.query({
            query:`For listing in crawled_listings 
                    Filter listing.listing_id == @listing_id
                    Update listing with @value in crawled_listings`,
            bindVars:{
                listing_id:listing.listing_id,
                value:final_data
            }
        })
        // await Listings.update(final_data, {where: {listing_id: listing.listing_id}});
        console.log(`Stored into DB: ${final_data.listing_id}`)

    } catch (e) {
        console.log(`Error: ${e.message}`)
        /*
            ***** DONE *****
            Replace into ArangoDB
            (Update old listing in case of error)
        */
        await arango.query({
            query:`
                For listing in crawled_listings
                Filter listing.listing_id == @listing_id
                Update listing with @value in crawled_listings
            `,
            bindVars:{
                listing_id:listing.listing_id,
                value:{
                    details_collection_status: true,
                    details_collection_status_message: 'failed'
                }
            }
        })
        // await Listings.update({
        //     details_collection_status: true,
        //     details_collection_status_message: 'failed'
        // }, {where: {listing_id: listing.listing_id}});

    } finally {
        if (browser)
            await browser.closeBrowser()
    }

}

(async () => {
    let start = new Date()
    let credentials = await cloud.get_credentials();
    /*
        ***** DONE *****
        Replace into ArangoDB
        (Fetch all listings with status = pendign)
    */
    let pendingListings = await arango.query(`For listing in crawled_listings
                Filter !listing.details_collection_status  and listing.platform == 'autotrader'
                Sort listing.created_at
                return listing
                `)
    let pendingListingsData = await pendingListings.all();
    // let pendingListings = await Listings.findAll({
    //     where: {details_collection_status: {[Op.or]: ['false', null]}, platform: 'autotrader'},
    //     limit: 15,
    //     order: [['created_at', 'ASC']]
    // })
    if (pendingListingsData.length < 1) {
        console.log(`No pending details for Autotrader listings`)
        process.exit(0)
    }
    console.log(`Total Listing: ${pendingListingsData.length}`)
    let proxy = {
        username: credentials.luminati.username,
        password: credentials.luminati.password
    };

    await asyncForEach(pendingListingsData, getDetails, {proxy})
    let end = new Date() - start
    console.info('Execution time: %dm', end / 1000 / 60)
    process.exit(0)
})()
