const Base = require('./base');
const tableName = 'Listings';

module.exports = class Listing extends Base {

    constructor(view) {
        super(tableName, view);
        this.LISTING_TYPE = {
            ADESA: 'adesa',
            AUTOTRADER: 'autotrader'
        }

    }

    create(params) {
        return super.create(params);
    }
};

