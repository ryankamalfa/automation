const arango = require('./arango');
const cloud = {
	
		async get_credentials(){
			/*
				Fetch autotrader login credentials
			*/
			const auth = await arango.query(`
				for c in script_settings 
					filter c.type == 'config'
					return {luminati: c.luminati, autotrader:c.autotrader}`);
			const auth_data = await auth.all();
			// console.log('auth_data',auth_data[0]);
			return auth_data[0];
		},
		async get_listings(){
			/*
				Fetch active listings
			*/
			const listings = await arango.query(`
				for l in listings 
					return l`);
			const listings_data = await listings.all();
			console.log('searched ------->  ',listings_data);
			return listings_data;
		}
}


module.exports = cloud;