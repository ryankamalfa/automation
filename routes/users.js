const express = require('express');
const router = express.Router();
const {
  addUser,
  editUser,
  getUsers,
  deleteUser
} = require('../controller/users');


const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log('sssssssss not auth');
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}



router.post('/add', addUser);
router.post('/edit', editUser);
router.get('/get', getUsers);
router.post('/delete', deleteUser);



module.exports = router;