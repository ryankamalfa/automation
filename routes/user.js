const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  getUserData
} = require('../controller/user');

const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log('sssssssss not auth');
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}

//login a user
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/get', getUserData);

router.post('/password/forget', forgetPassword);
router.post('/password/reset', resetPassword);


module.exports = router;
