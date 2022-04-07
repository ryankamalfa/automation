require('dotenv').config();
const db = require('../config/database');


const getCounts = async (req,res,done) =>{
	// console.log('sssssssssssssss');
	const counts = await db.query(`
	    return {dataset:length(listing_dataset),listings:length(listings),users:length(users)}
	    `);
	  let counts_data = await counts.all();
	  console.log('counts ------> ',counts_data);
	  res.send({ counts: counts_data[0] });
};








module.exports = {
	getCounts
};
