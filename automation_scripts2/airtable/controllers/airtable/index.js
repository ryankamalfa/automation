const Appraisal = require('./appraisal');
const Listing = require('./listing');

const listingView = 'viwhpQfEEcInE4tmS';
const appraisalView = 'viwqS4yhPQyBOHrlt';

module.exports = {
    BaseListing: new Listing(listingView),
    BaseAppraisal: new Appraisal(appraisalView),
};
