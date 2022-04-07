const express = require('express');
const router = express.Router();
const {
    getCounts
} = require('../controller/home');


const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log('sssssssss not auth');
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}



router.get('/counts', getCounts);


module.exports = router;