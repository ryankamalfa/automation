const Appraisal = require('./appraisal');
const Listing = require('./listing');

const listingView = 'viwOH9KQFeaXE7T6S';
const appraisalView = 'viwqS4yhPQyBOHrlt';

module.exports = {
    BaseListing: new Listing(listingView),
    // BaseAppraisal: new Appraisal(appraisalView),
};
