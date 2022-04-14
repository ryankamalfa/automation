require("dotenv").config();
const dealerSocket = require('./controllers/dealer-socket')
const {encodeStringForURI, asyncForEach, isFileExists} = require('./utils/helper');
const {Op} = require("sequelize");
const Listings = require('./model/listings');
const cloud = require('./model/cloud');
const arango = require('./model/arango');

(async function main() {
    /*
        Replace into ArangoDB
    */
    let listings = await arango.query({
        query:`for listing in crawled_listings
                    Filter listing.dealer_socket_status == @dealer_socket_status
                    and listing.vin == @vin
                    and listing.details_collection_status_message == @details_collection_status_message
                    Sort listing.created_at asc
                    limit 20
                    return l
                    `,
        bindVars:{
            dealer_socket_status: {
                [Op.eq]: null
            },
            vin: {
                [Op.ne]: null
            },
            details_collection_status_message: 'success'
        }
    });
    let listings_data = listings.all();
    // let listings = await Listings.findAll({
    //     where: {
    //         // vin: '1C6RR7MT7JS240170'
    //         dealer_socket_status: {
    //             [Op.eq]: null
    //         },
    //         vin: {
    //             [Op.ne]: null
    //         },
    //         details_collection_status_message: 'success'
    //     },
    //     limit: 20,
    //     order: [
    //         ['created_at', 'ASC']
    //     ],
    // })
    console.log(`Total listings to evaluate: ${listings_data.length}`)
    if (listings_data.length > 0) {
        await dealerSocket(listings_data)
        console.log(`Evaluation complete`)
    } else {
        console.log(`No listings to evaluate`)
    }
})()

