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

const Settings = database.define('settings', {
    purchase_type: {
        type: Sequelize.ENUM,
        values: [
            'Retail - Alberta',
            'Retail - Ontario',
            'Adesa - Alberta',
            'Adesa - Ontario'
        ]
    },
    depreciation: {type: Sequelize.DOUBLE},
    transport_cad: {type: Sequelize.DOUBLE},
    import: {type: Sequelize.DOUBLE},
    transport_us: {type: Sequelize.DOUBLE},
    recon: {type: Sequelize.DOUBLE},
    mg_admin: {type: Sequelize.DOUBLE},
    interest_45_days: {type: Sequelize.DOUBLE},
    rs_target_profit: {type: Sequelize.DOUBLE},
    fg_referral: {type: Sequelize.DOUBLE},

}, OPTIONS);
Settings.sync();

module.exports = Settings;
