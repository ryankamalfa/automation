const Base = require('./base');
const tableName = 'Appraisals';

module.exports = class Appraisal extends Base {

    constructor(view) {
        super(tableName, view);

    }

    create(params) {
        return super.create(params);
    }
};

