const express = require('express');
const router = express.Router();
const {
    updateConfig,
    getConfig,
    updateScriptSettings
} = require('../controller/config');


const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log('sssssssss not auth');
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}



router.post('/update', updateConfig);
router.post('/script/update', updateScriptSettings);
router.get('/get', getConfig);



module.exports = router;