const express = require('express');
const router = express.Router();
const {
    getAllMakes,
    getAllModels,
    getModelYearsList,
    getmodelTrimList,
    addNewListing,
    getActiveListings,
    deleteListing
} = require('../controller/listings');


const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log('sssssssss not auth');
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}



router.get('/makes/get', getAllMakes);
router.post('/models/get', getAllModels);

router.post('/modelYearslist/get', getModelYearsList);
router.post('/modelTrimList/get', getmodelTrimList);
// addNewListing
router.post('/active/add', addNewListing);
router.get('/active/get', getActiveListings);
router.post('/active/delete', deleteListing);


module.exports = router;