require("dotenv").config();

const helper = require('./utils/helper')
const Listings = require('./model/listings');
const {Op} = require("sequelize");
const {BaseListing} = require('./controllers/airtable/index');
const cloud = require('./model/cloud');
const arango = require('./model/arango');
// const async = require('async');

(async function () {
    while (true) {
        /*
            Replace into ArangoDB
        */ 
        

        let scriptSettings = await arango.query(`
            For o in script_settings
            Filter o.type == 'config'
            return o
            `);
        let scriptSettingsData = await scriptSettings.all();

        // async.series([
        //     function(callback){
        //         //push data to airtable

        //     },
        //     function(callback){
        //         //check and fix listings with missing data
        //     },
        //     ],function(){});
        
        

        // return;
        let listings =  await arango.query(`For listing in crawled_listings
                        Sort listing.created_at asc
                        Filter listing.script_id and listing.manheim and listing.vin and !listing.airtable  and listing.price or listing.start_price  and listing.US_base_mmr ${scriptSettingsData[0].autotrader.enable ? " and listing.platform == 'autotrader'" : ''} ${scriptSettingsData[0].adesa.enable ? " and listing.platform == 'adesa'" : ''}
                        return {listing_id:listing.listing_id,platform:listing.platform,
                            search_trim:listing.search_trim,
                            search_make:listing.search_make,
                            search_model:listing.search_model,
                            vehicle_age:listing.vehicle_age,
                            kilometres:listing.kilometres,
                            status:listing.status,
                            vin:listing.vin,
                            make:listing.make,
                            model:listing.model,
                            year:listing.year,
                            trim:listing.trim,
                            style:listing.style,
                            price:listing.price,
                            location:listing.location,
                            miles:listing.miles,
                            body_type:listing.body_type,
                            engine:listing.engine,
                            cylinder:listing.cylinder,
                            transmission:listing.transmission,
                            drivetrain:listing.drivetrain,
                            exterior_colour:listing.exterior_colour,
                            interior_colour:listing.interior_colour,
                            passengers:listing.passengers,
                            doors:listing.doors,
                            fuel_type:listing.fuel_type,
                            options:listing.options,
                            highlights:listing.highlights,
                            listing_url:listing.listing_url,
                            auto_grade:listing.auto_grade,
                            dealer:listing.dealer,
                            province:listing.province,
                            start_price:listing.start_price,
                            US_base_mmr:listing.US_base_mmr,
                            US_adjusted_mmr:listing.US_adjusted_mmr,
                            US_estimated_retail_value:listing.US_estimated_retail_value,
                            CA_base_mmr:listing.CA_base_mmr,
                            CA_adjusted_mmr:listing.CA_adjusted_mmr,
                            CA_estimated_retail_value:listing.CA_estimated_retail_value,
                            created_at:listing.created_at,
                            updated_at:listing.updated_at,
                            exchange_rate:listing.exchange_rate,
                            script_id:listing.script_id,

                        }

                            `);
        // await arango.query({
            // query:,
            // bindVars:{
            //     vin: {
            //         [Op.ne]: null
            //     },
            //     total_appraisals_collected: {
            //         [Op.gt]: 0
            //     },
            //     airtable: {
            //         [Op.eq]: null
            //     }
            // }
        // })
        let listings_data = await listings.all();
        // let listings = await Listings.findAll({
        //     attributes: [
        //     'dealer_socket_comment', 'dealer_socket_price', 'created_at', 'updated_at', 'total_comparables', 
        //     'total_appraisals_collected', 'appraisal_miles_1', 'appraisal_price_1', 'appraisal_miles_2', 
        //     'appraisal_price_2', 'appraisal_miles_3', 'appraisal_price_3', 'appraisal_miles_4', 
        //     'appraisal_price_4'],
        //     where: {
                
        //     },
        //     order: [
        //         ['created_at', 'ASC']
        //     ],
        //     limit: 10,

        // });
        console.log(`listings: ${listings_data.length}`)
        if (listings_data.length === 0){
            console.log(`No listings to move to Airtable`)
            process.exit(0)
        }
        listings_data.map(x => x.year = `${x.year}`);
        listings_data.map(x => x.price = parseFloat(x.price));
        listings_data.filter(x => !x.price).map(x => x.price = x.start_price)
        listings_data.map(x => x.passengers = parseInt(x.passengers));
        listings_data.map(x => x.doors = parseInt(x.doors));

        
        await helper.asyncForEach(listings_data, async (listing, index, listings, paramObj) => {
            let airtableListing = await paramObj.BaseListing.findOrCreate(listing.listing_id);
            console.log(`airtableListing.id: ${airtableListing.id}`);
            console.log('year',listing.year);
            console.log('price',listing.price);
            await paramObj.BaseListing.update(airtableListing.id, listing)
                .then(async () => {
                        /*
                            Replace into ArangoDB
                        */
                        await arango.query({
                            query:`For listing in crawled_listings
                                    Filter listing.listing_id == @listing_id
                                    update listing with {"airtable": true} in crawled_listings`,
                            bindVars:{
                                listing_id: listing.listing_id
                            }
                        })
                        console.log(`airtable status has been updated`)
                    }
                )
                .catch(e => {
                    console.error(`Error: ${e}`)
                    process.exit(1);
                })

        }, {BaseListing, Listings})



        /*
            This part is checking for data with missing values and update it
        */

        // let toFixListings = await BaseListing.findListingsWithMissingData();
        // let toFixListingsObject = await arango.query({
        //     query:`For listing in crawled_listings
        //     filter listing.listing_id in @ids
        //     return {listing_id:listing.listing_id,platform:listing.platform,
        //                     search_trim:listing.search_trim,
        //                     search_make:listing.search_make,
        //                     search_model:listing.search_model,
        //                     vehicle_age:listing.vehicle_age,
        //                     kilometres:listing.kilometres,
        //                     status:listing.status,
        //                     vin:listing.vin,
        //                     make:listing.make,
        //                     model:listing.model,
        //                     year:listing.year,
        //                     trim:listing.trim,
        //                     style:listing.style,
        //                     price:listing.price,
        //                     location:listing.location,
        //                     miles:listing.miles,
        //                     body_type:listing.body_type,
        //                     engine:listing.engine,
        //                     cylinder:listing.cylinder,
        //                     transmission:listing.transmission,
        //                     drivetrain:listing.drivetrain,
        //                     exterior_colour:listing.exterior_colour,
        //                     interior_colour:listing.interior_colour,
        //                     passengers:listing.passengers,
        //                     doors:listing.doors,
        //                     fuel_type:listing.fuel_type,
        //                     options:listing.options,
        //                     highlights:listing.highlights,
        //                     listing_url:listing.listing_url,
        //                     auto_grade:listing.auto_grade,
        //                     dealer:listing.dealer,
        //                     province:listing.province,
        //                     start_price:listing.start_price,
        //                     US_base_mmr:listing.US_base_mmr,
        //                     US_adjusted_mmr:listing.US_adjusted_mmr,
        //                     US_estimated_retail_value:listing.US_estimated_retail_value,
        //                     CA_base_mmr:listing.CA_base_mmr,
        //                     CA_adjusted_mmr:listing.CA_adjusted_mmr,
        //                     CA_estimated_retail_value:listing.CA_estimated_retail_value,
        //                     created_at:listing.created_at,
        //                     updated_at:listing.updated_at,
        //                     exchange_rate:listing.exchange_rate,
        //                     script_id:listing.script_id,
        //                 }
        //     `,
        //     bindVars:{
        //         ids:toFixListings
        //     }
        // });
        // let toFixListingsData = await toFixListingsObject.all();


        // // console.log('----------',toFixListingsData);


        // toFixListingsData.map(x => x.year = `${x.year}`);
        // toFixListingsData.map(x => x.price = parseFloat(x.price));
        // toFixListingsData.filter(x => !x.price).map(x => x.price = x.start_price)
        // toFixListingsData.map(x => x.passengers = parseInt(x.passengers));
        // toFixListingsData.map(x => x.doors = parseInt(x.doors));
        // await helper.asyncForEach(toFixListingsData, async (listing, index, listings, paramObj) => {
        //     let airtableListing = await paramObj.BaseListing.findOrCreate(listing.listing_id);
        //     console.log(`airtableListing.id: ${airtableListing.id}`);
        //     console.log('year',listing.year);
        //     console.log('price',listing.price);
        //     console.log('script_id',listing.script_id);
        //     await paramObj.BaseListing.update(airtableListing.id, listing)
        //         .then(async () => {
        //                 /*
        //                     Replace into ArangoDB
        //                 */
        //                 await arango.query({
        //                     query:`For listing in crawled_listings
        //                             Filter listing.listing_id == @listing_id
        //                             update listing with {"airtable": true} in crawled_listings`,
        //                     bindVars:{
        //                         listing_id: listing.listing_id
        //                     }
        //                 })
        //                 console.log(`airtable status has been updated`)
        //             }
        //         )
        //         .catch(e => {
        //             console.error(`Error: ${e}`)
        //             process.exit(1);
        //         })

        // }, {BaseListing, Listings})

        
        console.log(`ENDING....`)
        process.exit(0);
        // console.log(`Executing delay`)
        // await helper.sleepForSeconds(10, 15);
    }

})()
