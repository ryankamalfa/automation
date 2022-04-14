const Sequelize = require('sequelize');
const database = require('./database');
const Listings = require('./listings')
const ignoreField = field => (entity, options) => {
    options.fields = options.fields.filter(col => col !== field);
};
const OPTIONS = {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
};

const Appraisals = database.define('appraisals', {
    appraisal_vin: {type: Sequelize.TEXT},
    appraisal_price: {type: Sequelize.DOUBLE},
    appraisal_miles: {type: Sequelize.INTEGER},
    listing_id: {type: Sequelize.TEXT}
}, OPTIONS);

// Listings.hasMany(Appraisals, {
//     foreignKey: 'listing_id',
//     sourceKey: 'listing_id'
// })
//
// Appraisals.belongsTo(Listings, {
//     foreignKey: 'listing_id',
//     targetKey: 'listing_id'
// })

Appraisals.addOrUpdateListing = async function (model, options) {
    if (!model.id) {
        throw new Error(`Can't add a new listing without appraisal_id attribute`);
    }

    const oldListing = await Appraisals.findOne({where: {id: model.id}}, options);

    if (!oldListing) {
        return Appraisals.create(model, options);
    } else {
        return Appraisals.update(model, options);
    }
}

module.exports = Appraisals;
