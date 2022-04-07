require('dotenv').config();
// const Token = require("../models/Token");
const db = require('../config/database');


const validateToken = (userId, token) => {
	console.log('sssssssssssss');

 		return new Promise(async (resolve)=>{
 			let token_query = await db.query(`
	          FOR t IN tokens FILTER t.token == '${token}' Filter t.userId == '${userId}' limit 1 RETURN t
	          `);
	        let tokenExist = await token_query.all();
		console.log('tokeeeeeen',tokenExist[0]);
		if(tokenExist[0] && tokenExist[0].unUsed){
			let tokenCreatedAt = new Date(tokenExist[0].createdAt);
			// console.log('tokenCreatedAt',tokenCreatedAt);
			let validateAt = new Date();
			let difference = validateAt.getTime() - tokenCreatedAt.getTime(); // This will give difference in milliseconds
			let resultInMinutes = Math.round(difference / 60000);
			// console.log('token create from minutes ',resultInMinutes);
			if(resultInMinutes > process.env.TOKEN_EXPIRY_AFTER){
				// console.log('token expired');
				return false;
			}else{

				await db.query(`update '${tokenExist[0]._key}' WITH {
				    unUsed:false
				} in tokens`);
				resolve(true);
			}
		}else{
			console.log('Token not valid');
			resolve(false);
		}	
 		})
}



module.exports = validateToken;