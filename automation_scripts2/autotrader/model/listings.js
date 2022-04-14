const Sequelize = require('sequelize');
const database = require('./database');
const ignoreField = field => (entity, options) => {
    options.fields = options.fields.filter(col => col !== field);
};
const OPTIONS = {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
};

const Listings = database.define('listings', {
    listing_id: {type: Sequelize.TEXT, unique: true},
    platform: {type: Sequelize.TEXT},
    search_make: {type: Sequelize.TEXT},
    search_model: {type: Sequelize.TEXT},
    search_trim: {type: Sequelize.TEXT},
    vin: {type: Sequelize.TEXT},
    make: {type: Sequelize.TEXT},
    model: {type: Sequelize.TEXT},
    year: {type: Sequelize.TEXT},
    trim: {type: Sequelize.TEXT},
    style: {type: Sequelize.TEXT},
    price: {type: Sequelize.DOUBLE},
    location: {type: Sequelize.TEXT},
    miles: {type: Sequelize.INTEGER},
    vehicleAge: {type: Sequelize.TEXT},
    kilometres: {type: Sequelize.INTEGER},
    status: {type: Sequelize.TEXT},
    body_type: {type: Sequelize.TEXT},
    engine: {type: Sequelize.TEXT},
    cylinder: {type: Sequelize.TEXT},
    transmission: {type: Sequelize.TEXT},
    drivetrain: {type: Sequelize.TEXT},
    exterior_colour: {type: Sequelize.TEXT},
    interior_colour: {type: Sequelize.TEXT},
    passengers: {type: Sequelize.TEXT},
    doors: {type: Sequelize.TEXT},
    fuel_type: {type: Sequelize.TEXT},
    options: {type: Sequelize.TEXT},
    highlights: {type: Sequelize.TEXT},
    listing_url: {type: Sequelize.TEXT},
    auto_grade: {type: Sequelize.TEXT},
    dealer: {type: Sequelize.TEXT},
    province: {type: Sequelize.TEXT},
    start_price: {type: Sequelize.DOUBLE},
    dealer_socket_status: {type: Sequelize.TEXT},
    dealer_socket_comment: {type: Sequelize.TEXT},
    dealer_socket_price: {type: Sequelize.DOUBLE},
    details_collection_status: {type: Sequelize.DOUBLE},
    details_collection_status_message: {type: Sequelize.TEXT},
}, OPTIONS);
Listings.sync();
Listings.prototype.addOrUpdateListing = async function (listing, options) {
    if (!listing.listing_id) {
        throw new Error(`Can't add a new listing without listing_id attribute`);
    }

    const oldListing = await Listings.findOne({where: {listing_id: listing.listing_id}});

    if (!oldListing) {
        return Listings.create(listing);
    } else {
        return Listings.update(listing, {where: {listing_id: listing.listing_id}});
    }
}

module.exports = Listings;
