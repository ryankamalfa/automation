require("dotenv").config();

const helper = require('./utils/helper')
const Listings = require('./model/listings');
const {Op} = require("sequelize");
const {BaseListing} = require('./controllers/airtable/index');
const cloud = require('./model/cloud');
const arango = require('./model/arango');

(async function () {
    while (true) {
        /*
            Replace into ArangoDB
        */
        
        let listings =  await arango.query(`For listing in crawled_listings
                        Sort listing.created_at asc
                        Filter listing.vin and !listing.airtable
                        limit 1000
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
                            dealer_socket_comment:listing.dealer_socket_comment,
                            dealer_socket_price:listing.dealer_socket_price,
                            created_at:listing.created_at,
                            updated_at:listing.updated_at,
                            total_comparables:listing.total_comparables,
                            total_appraisals_collected:listing.total_appraisals_collected,
                            appraisal_miles_1:listing.appraisal_miles_1,
                            appraisal_price_1:listing.appraisal_price_1,
                            appraisal_miles_2:listing.appraisal_miles_2,
                            appraisal_price_2:listing.appraisal_price_2,
                            appraisal_miles_3:listing.appraisal_miles_3,
                            appraisal_price_3:listing.appraisal_price_3,
                            appraisal_miles_4:listing.appraisal_miles_4,
                            appraisal_price_4:listing.appraisal_price_4}

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
        if (listings_data.length === 0) {
            console.log(`No listings to move to Airtable`)
            process.exit(0)
        }
        // listings_data.map(x => x.year = `${x.year}`)
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
                        // await Listings.update({
                        //         "airtable": true
                        //     },
                        //     {
                        //         where: {
                        //             listing_id: listing.listing_id
                        //         }
                        //     })
                        console.log(`airtable status has been updated`)
                    }
                )
                .catch(e => {
                    console.error(`Error: ${e}`)
                    process.exit(1);
                })

        }, {BaseListing, Listings})
        console.log(`ENDING....`)
        process.exit(0);
        // console.log(`Executing delay`)
        // await helper.sleepForSeconds(10, 15);
    }

})()
