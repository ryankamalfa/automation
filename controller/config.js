require('dotenv').config();
const db = require('../config/database');


const updateConfig = async (req,res,done) =>{
	
	const {config} = req.body;
	console.log('-------------',config);
	await db.query({
		query:`upsert {type:'${config.type}'}
			   insert @config
			   update @config
			   in script_settings`,
		bindVars:{
			config: config
		}
	});
	res.send({ success:true });
};




const getConfig = async (req,res,done) =>{
	const config = await db.query(`
		FOR x IN script_settings filter x.type == '${req.query.type}' RETURN x 
		`);
	const config_data = await config.all();
	console.log('config data from database',config_data[0]);
	res.send({ config: config_data[0] });
};








module.exports = {
	updateConfig,
	getConfig,
};
